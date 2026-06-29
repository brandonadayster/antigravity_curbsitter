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

  // 2. Database client setup
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
