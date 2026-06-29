---
name: velvet-rope-onboarding
triggers: 
  - "build the onboarding flow"
  - "create the waitlist"
  - "setup lead generation"
description: "Executes the 4-step 'Velvet Rope' onboarding and Mapbox-driven waitlist logic for CurbSitter."
---

# Velvet Rope Onboarding Execution

Execute the following UI and logic implementation for the CurbSitter onboarding flow using a conversion-optimized 4-step multi-step form wrapper with a top-mounted progress bar.

## Step 1: Boundary & Zip Code Verification
* **UI:** A high-contrast hero section with a single primary input: "Check Availability" (Zip Code). 
* **Validation Logic:** Check input against the approved Prescott array: `[86301, 86302, 86303, 86304, 86305, 86318]`.
* **Routing:**
  * **Pass:** Dynamically advance to Step 2.
  * **Fail (Waitlist):** Instantly display the premium waitlist rejection layout. Capture Name, Email, Phone. Display message: *"Thank you. We are expanding rapidly. You will be notified the moment CurbSitter is available in your neighborhood."* Store in Supabase `leads` table.

## Step 2: Contact Info & Address Autocomplete
* **Fields:** First Name, Last Name, Preferred Contact Method (radio: phone, text, email), Mobile Phone, SMS Opt-In, Email Address.
* **Address Field:** Integrate Mapbox Geocoding API for JavaScript address autocomplete.
* **Property Classification:** Dropdown for Property Type (Single Family, HOA, Short-Term Rental).

## Step 3: Service Configuration & Cost Engine
* **Logic:** Live cost-calculation engine based on bin volume and collection days.
* **Incentives UI:** Build a toggle/slider for "Quarterly Billing" that automatically applies a 10% discount to the calculated total. 

## Step 4: Checkout & Exit Intent
* **Payments:** Integrate Stripe Elements. Must support Credit Cards, Apple Pay, Google Pay, and **ACH Direct Debit**.
* **ACH Push:** Highlight ACH with a "$5 Autopay Discount" badge to encourage lower processing fees.
* **Exit Intent:** If the user moves to close the tab, trigger an exit-intent modal with a click-to-call button stating: *"Need immediate assistance? Call us directly at (520) 225-9713."*
