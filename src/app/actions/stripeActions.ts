"use server";

import { createClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";

/**
 * Creates a Stripe Checkout Session for onboarding valet customers.
 * Prioritizes us_bank_account (ACH) and standard card payments.
 */
export async function createCheckoutSession(userId: string, billingCycle: "monthly" | "quarterly") {
  try {
    console.log(`--- CREATING STRIPE CHECKOUT SESSION: User ${userId}, Plan ${billingCycle} ---`);

    // 1. Validate Supabase environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase environment keys are missing");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 2. Fetch customer lead parameters from waitlist
    const { data: lead, error: dbError } = await supabase
      .from("waitlist")
      .select("*")
      .eq("id", userId)
      .single();

    if (dbError || !lead) {
      console.error("Database Fetch Error for lead:", dbError);
      throw new Error(`Failed to retrieve waitlist record for ID: ${userId}`);
    }

    // 3. Pricing Matrix Calculation (in Cents)
    // Base monthly rate: $49.00
    // Quarterly prepay rate: $49.00 * 3 = $147.00. 10% Discount = $132.30. Apply $10.00 flat discount = $122.30.
    const baseMonthlyPriceCents = 4900;
    const baseQuarterlyPriceCents = 13230; 
    const quarterlyDiscountCents = 1000; 

    let priceInCents = baseMonthlyPriceCents;
    let intervalCount = 1;

    if (billingCycle === "quarterly") {
      priceInCents = baseQuarterlyPriceCents - quarterlyDiscountCents;
      intervalCount = 3;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // 4. Match or create Stripe Customer
    let customerId: string | undefined;
    try {
      const customers = await stripe.customers.list({
        email: lead.email,
        limit: 1,
      });

      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: lead.email,
          name: `${lead.first_name} ${lead.last_name}`,
          phone: lead.phone || undefined,
          metadata: { userId },
        });
        customerId = customer.id;
      }
    } catch (customerErr) {
      console.error("Error matching Stripe Customer:", customerErr);
    }

    // 5. Build Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : lead.email,
      payment_method_types: ["us_bank_account", "card"],
      payment_method_options: {
        us_bank_account: {
          financial_connections: {
            permissions: ["payment_method"],
          },
        },
      },
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "CurbSitter Concierge Service",
              description: billingCycle === "quarterly" 
                ? "Premium Weekly Valet Service (Billed Quarterly - $10 Off)" 
                : "Premium Weekly Valet Service (Billed Monthly)",
            },
            unit_amount: priceInCents,
            recurring: {
              interval: "month",
              interval_count: intervalCount,
            },
          },
          quantity: 1,
        },
      ],
      client_reference_id: userId,
      metadata: { userId, billingCycle },
      success_url: `${appUrl}/customer-dashboard?tab=overview&checkout=success`,
      cancel_url: `${appUrl}/onboarding?checkout=cancelled`,
    });

    console.log("Stripe Session created successfully:", session.id);
    return { success: true, url: session.url };

  } catch (err) {
    console.error("Checkout Session Action Caught Error:", err);
    return { success: false, error: err instanceof Error ? err.message : "An unexpected error occurred." };
  }
}

/**
 * Creates a Stripe Customer Portal Session for billing configuration and adjustments.
 */
export async function createCustomerPortalSession(userId: string) {
  try {
    console.log(`--- CREATING CUSTOMER PORTAL SESSION: User ${userId} ---`);

    // 1. Validate Supabase environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase environment keys are missing");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 2. Fetch User/Lead details
    const { data: lead, error: dbError } = await supabase
      .from("waitlist")
      .select("email")
      .eq("id", userId)
      .single();

    if (dbError || !lead) {
      throw new Error(`Failed to retrieve waitlist record for ID: ${userId}`);
    }

    // 3. Query Stripe for existing Customer ID
    const customers = await stripe.customers.list({
      email: lead.email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      throw new Error(`No Stripe Customer record found for email: ${lead.email}`);
    }

    const customerId = customers.data[0].id;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // 4. Create Billing Portal Redirect Session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${appUrl}/customer-dashboard?tab=billing`,
    });

    console.log("Customer Portal Session created successfully:", portalSession.id);
    return { success: true, url: portalSession.url };

  } catch (err) {
    console.error("Customer Portal Session Action Caught Error:", err);
    return { success: false, error: err instanceof Error ? err.message : "An unexpected error occurred." };
  }
}
