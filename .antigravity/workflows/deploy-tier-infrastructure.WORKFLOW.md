---
name: deploy-tier-infrastructure
description: "Sequential pipeline for setting up Stripe payment tiers and the Supabase backend."
version: 1.2.0
---

# Infrastructure Deployment Pipeline

Follow these steps in strict order to establish the premium service tiers and the core backend tables.

## Phase 1: Stripe Integration & Tier Logic
1.  **Initialize Stripe Client:** Set up the Stripe SDK within the Next.js API routes (`/api/stripe/*`).
2.  **Create Product Tiers:** Generate the UI components and matching Stripe Price IDs for:
    * **Starter ($45/mo):** Up to 2 cans, one collection day per week.
    * **Premium ($59/mo):** Up to 4 cans, two collection days per week, full dashboard access, photo-verification. (Targeted heavily at Vacation Rentals).
    * **Concierge ($65+/mo):** Up to 6 cans, dedicated account manager.
3.  **Implement ACH Logic:** Configure Stripe checkout to prioritize ACH Direct Debit (0.8% capped at $5) over standard Credit Card processing (2.9% + 30¢) to maximize margins.
4.  **Configure Webhooks:** Create `/api/webhooks/stripe` to listen for `checkout.session.completed` and `customer.subscription.updated`.

## Phase 2: Role-Based Routing & Database Schema
1.  **Supabase Auth:** Set up Supabase authentication with custom claims for `role`: `customer`, `worker`, `admin`.
2.  **Database Schema Generation:** Create tables for:
    * `users` (id, role, subscription_status, stripe_customer_id)
    * `properties` (id, user_id, address, lat, lng, gate_codes, notes)
    * `service_logs` (id, property_id, worker_id, status, photo_url, timestamp)
3.  **Dashboard Routing Middleware:** Implement Next.js middleware to strictly protect `/customer-dashboard`, `/runner-app`, and `/admin`.
