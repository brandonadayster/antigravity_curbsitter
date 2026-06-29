---
name: customer-portal-management
triggers: 
  - "build the customer dashboard"
  - "setup the user portal"
  - "create account management"
description: "Generates the secure customer portal allowing users to manage gates codes, view invoices, and pause service."
---

# Customer Portal Execution

When triggered, build the `/customer-dashboard` route using the Next.js App Router and Supabase Auth. The dashboard must maintain the premium "glassmorphism" aesthetic.

## Core Features to Implement:
1.  **Overview Widget:** Display current subscription tier, next scheduled service date, and the most recent "Proof-of-Work" photo synced from the `service_logs` table.
2.  **Property Management:** A secure form to update gate codes, garage codes, or specific instructions for the runner (e.g., "Beware of dog," "Side gate sticks"). Update this in the `properties` table.
3.  **Snowbird / Vacation Pause:** A toggle component allowing the user to pause their service. 
    * Must include date-picker for Start/End dates.
    * Must validate that the pause is initiated at least 24 hours prior to the next billing date.
    * Update Stripe subscription status to pause billing accordingly.
4.  **Billing & Invoices:** Display a history of past Stripe invoices and allow the user to securely update their payment method (strongly encourage ACH).
