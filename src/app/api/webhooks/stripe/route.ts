import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") || "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("[STRIPE WEBHOOK ERROR] Missing STRIPE_WEBHOOK_SECRET env variable");
    return new NextResponse("Webhook secret configuration error", { status: 500 });
  }

  let event;

  // 1. Cryptographic signature check
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown verification error";
    console.error(`[STRIPE WEBHOOK ERROR] Signature verification failed: ${errorMsg}`);
    return new NextResponse(`Webhook signature verification failed: ${errorMsg}`, { status: 400 });
  }

  console.log(`[STRIPE WEBHOOK LOG] Received event: ${event.type}`);

  // 2. Database client setup - Prioritize Service Role Key to bypass RLS for administrative actions
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("[STRIPE WEBHOOK ERROR] Missing Supabase database connection variables");
    return new NextResponse("Database configuration error", { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 3. Handle checkout completion event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id || session.metadata?.userId;

      if (!userId) {
        console.warn("[STRIPE WEBHOOK WARNING] checkout.session.completed had no userId parameter in client_reference_id or metadata");
        return NextResponse.json({ success: true, warning: "No userId attached" });
      }

      console.log(`[STRIPE WEBHOOK LOG] Checkout session completed. Syncing user status to Active: ${userId}`);

      const { error } = await supabase
        .from("waitlist")
        .update({ status: "Active" })
        .eq("id", userId);

      if (error) {
        console.error(`[STRIPE WEBHOOK ERROR] Supabase status update failed for user ${userId}:`, error.message);
        throw new Error(`Database status sync failed: ${error.message}`);
      }

      console.log(`[STRIPE WEBHOOK LOG] User ${userId} status updated to Active successfully.`);

      // Handle referral processing
      const referredByUsername = session.metadata?.referred_by_username;
      if (session.payment_status === "paid" && referredByUsername) {
        console.log(`[STRIPE WEBHOOK LOG] Referral metadata found. Referrer: ${referredByUsername}`);
        
        // Query profiles table for the referrer
        const { data: referrer, error: referrerError } = await supabase
          .from("profiles")
          .select("id, stripe_customer_id")
          .eq("username", referredByUsername)
          .single();

        if (referrerError || !referrer) {
          console.warn(`[STRIPE WEBHOOK WARNING] Referring user "${referredByUsername}" not found in profiles:`, referrerError?.message);
        } else {
          const referrerStripeCustomerId = referrer.stripe_customer_id;
          if (!referrerStripeCustomerId) {
            console.error(`[STRIPE WEBHOOK ERROR] Referring user "${referredByUsername}" (ID: ${referrer.id}) does not have a stripe_customer_id`);
          } else {
            // Verify new user profile exists in profiles table to prevent foreign key violation in referral_credits
            const { data: newUserProfile, error: newUserError } = await supabase
              .from("profiles")
              .select("id")
              .eq("id", userId)
              .single();

            if (newUserError || !newUserProfile) {
              console.warn(`[STRIPE WEBHOOK WARNING] New user profile "${userId}" not found in profiles table: ${newUserError?.message || "No record"}. Returning 500 for Stripe retry.`);
              throw new Error("New user profile not found, triggering retry");
            }

            console.log(`[STRIPE WEBHOOK LOG] Applying -$20.00 customer balance transaction to referrer customer ID: ${referrerStripeCustomerId}`);
            try {
              await stripe.customers.createBalanceTransaction(referrerStripeCustomerId, {
                amount: -2000,
                currency: "usd",
                description: `Referral bonus for inviting user ${userId}`,
              }, {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                apiVersion: "2022-11-15" as any
              });
            } catch (stripeErr) {
              const stripeErrorMsg = stripeErr instanceof Error ? stripeErr.message : "Unknown Stripe error";
              console.error("[STRIPE WEBHOOK ERROR] Failed to apply Stripe customer balance transaction:", stripeErrorMsg);
              throw new Error(`Stripe balance transaction failed: ${stripeErrorMsg}`);
            }

            // Log referral credit in Supabase
            console.log(`[STRIPE WEBHOOK LOG] Logging referral credit in referral_credits table for referrer: ${referrer.id}, new user: ${userId}`);
            const { error: insertError } = await supabase
              .from("referral_credits")
              .insert([
                {
                  referrer_id: referrer.id,
                  new_user_id: userId,
                  amount: 20,
                }
              ]);

            if (insertError) {
              console.error("[STRIPE WEBHOOK ERROR] Failed to insert record into referral_credits:", insertError.message);
              throw new Error(`Database insert into referral_credits failed: ${insertError.message}`);
            }

            console.log(`[STRIPE WEBHOOK LOG] Referral processed successfully for referrer: ${referrer.id}, new user: ${userId}`);
          }
        }
      }
    }

    // 4. Handle recurring invoice clearance event
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer;
      
      if (customerId) {
        const customer = await stripe.customers.retrieve(customerId as string);
        if (!customer.deleted) {
          const userId = customer.metadata?.userId;
          if (userId) {
            console.log(`[STRIPE WEBHOOK LOG] Invoice payment cleared. Verifying user status: ${userId}`);

            const { error } = await supabase
              .from("waitlist")
              .update({ status: "Active" })
              .eq("id", userId);

            if (error) {
              console.error(`[STRIPE WEBHOOK ERROR] Supabase invoice update failed for user ${userId}:`, error.message);
              throw new Error(`Database status sync failed: ${error.message}`);
            }

            console.log(`[STRIPE WEBHOOK LOG] User ${userId} status verified as Active.`);
          }
        }
      }
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown webhook execution error";
    console.error(`[STRIPE WEBHOOK EXCEPTION] Failed to process webhook event ${event.type}: ${errorMsg}`);
    return new NextResponse(`Webhook processing error: ${errorMsg}`, { status: 500 });
  }
}
