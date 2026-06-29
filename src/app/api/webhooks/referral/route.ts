import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") || "";
  const webhookSecret = process.env.STRIPE_REFERRAL_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[REFERRAL WEBHOOK ERROR] Missing STRIPE_WEBHOOK_SECRET or STRIPE_REFERRAL_WEBHOOK_SECRET");
    return new NextResponse("Webhook secret configuration error", { status: 500 });
  }

  let event: Stripe.Event;

  // 1. Cryptographic signature check
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown verification error";
    console.error(`[REFERRAL WEBHOOK ERROR] Signature verification failed: ${errorMsg}`);
    return new NextResponse(`Webhook signature verification failed: ${errorMsg}`, { status: 400 });
  }

  console.log(`[REFERRAL WEBHOOK LOG] Received event: ${event.type}`);

  // 2. Database client setup - using Service Role Key to bypass RLS
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("[REFERRAL WEBHOOK ERROR] Missing Supabase database connection variables");
    return new NextResponse("Database configuration error", { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 3. Handle checkout completion event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const referredByUsername = session.metadata?.referred_by_username;
      const newUserId = session.client_reference_id || session.metadata?.userId;

      // If there is no referrer username, it's not a referral checkout. Skip gracefully.
      if (!referredByUsername) {
        console.log("[REFERRAL WEBHOOK LOG] Checkout session completed without referral metadata. Skipping.");
        return NextResponse.json({ success: true, message: "No referrer username in metadata" });
      }

      if (!newUserId) {
        console.error("[REFERRAL WEBHOOK ERROR] Checkout session completed without a valid user ID (client_reference_id or metadata.userId)");
        return NextResponse.json({ success: false, error: "New user ID missing from session" }, { status: 400 });
      }

      console.log(`[REFERRAL WEBHOOK LOG] Processing referral. Referrer: ${referredByUsername}, New User: ${newUserId}`);

      // Query profiles table for the referrer
      const { data: referrer, error: referrerError } = await supabase
        .from("profiles")
        .select("id, stripe_customer_id")
        .eq("username", referredByUsername)
        .single();

      if (referrerError || !referrer) {
        console.warn(`[REFERRAL WEBHOOK WARNING] Referring user "${referredByUsername}" not found in profiles:`, referrerError?.message);
        return NextResponse.json({ success: true, warning: "Referring user not found in database" });
      }

      const referrerStripeCustomerId = referrer.stripe_customer_id;
      if (!referrerStripeCustomerId) {
        console.error(`[REFERRAL WEBHOOK ERROR] Referring user "${referredByUsername}" (ID: ${referrer.id}) does not have a stripe_customer_id`);
        return NextResponse.json({ success: false, error: "Referrer missing Stripe Customer ID" }, { status: 400 });
      }

      // Verify that the new user's profile exists to avoid foreign key violations in referral_credits
      const { data: newUserProfile, error: newUserError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", newUserId)
        .single();

      if (newUserError || !newUserProfile) {
        console.warn(`[REFERRAL WEBHOOK WARNING] New user profile "${newUserId}" not found in profiles: ${newUserError?.message || "No record"}. Returning 500 for Stripe retry.`);
        // Returning 500 allows Stripe to retry the webhook later, by which time the profile should have been created
        return new NextResponse("New user profile not found, retrying later", { status: 500 });
      }

      // Apply customer balance transaction (-$20.00, which is -2000 cents)
      console.log(`[REFERRAL WEBHOOK LOG] Applying -$20.00 balance credit to referrer customer ID: ${referrerStripeCustomerId}`);
      try {
        await stripe.customers.createBalanceTransaction(referrerStripeCustomerId, {
          amount: -2000,
          currency: "usd",
          description: `Referral bonus for inviting user ${newUserId}`,
        });
      } catch (stripeErr) {
        const stripeErrorMsg = stripeErr instanceof Error ? stripeErr.message : "Unknown Stripe API error";
        console.error("[REFERRAL WEBHOOK ERROR] Failed to apply Stripe customer balance transaction:", stripeErrorMsg);
        throw new Error(`Stripe balance transaction failed: ${stripeErrorMsg}`);
      }

      // Log referral credit record in Supabase
      console.log(`[REFERRAL WEBHOOK LOG] Logging referral credit in referral_credits table for referrer: ${referrer.id}, new user: ${newUserId}`);
      const { error: insertError } = await supabase
        .from("referral_credits")
        .insert([
          {
            referrer_id: referrer.id,
            new_user_id: newUserId,
            amount: 20,
          }
        ]);

      if (insertError) {
        console.error("[REFERRAL WEBHOOK ERROR] Failed to insert record into referral_credits:", insertError.message);
        throw new Error(`Database insert into referral_credits failed: ${insertError.message}`);
      }

      console.log(`[REFERRAL WEBHOOK LOG] Referral processed successfully for referrer: ${referrer.id}, new user: ${newUserId}`);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    console.error(`[REFERRAL WEBHOOK EXCEPTION] Exception caught during processing: ${errorMsg}`);
    return new NextResponse(`Webhook execution error: ${errorMsg}`, { status: 500 });
  }
}
