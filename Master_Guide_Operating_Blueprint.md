Welcome to the **CurbSitter Master Guide & Operating Blueprint**. Per your request, all past documentation, conceptual pivots (from Scoop2Go and BleepSweep), and technical interactions have been meticulously reviewed, parsed, and synthesized.  
All conflicting or outdated data—specifically regarding residential dog waste removal—has been discarded. This unified document now serves as the single source of truth for the CurbSitter business model, strategy, and Antigravity 2.0 technical deployment.

## **📑 Exhaustive Table of Contents**

1. [Executive Summary & Brand Identity](#bookmark=id.e4oplebtw4ez)  
2. [Target Market & Demographic Focus](#bookmark=id.8zst7id5usjx)  
3. [Service Scope & Business Model](#bookmark=id.oe3tqfsadlt5)  
4. [Pricing Strategy & Revenue Engine](#bookmark=id.emyekxdf9vq6)  
5. [Marketing, Sales & Onboarding ("The Velvet Rope")](#bookmark=id.lovvxwmu75j1)  
6. [Technology Stack & Platform Architecture](#bookmark=id.vr0esru6iw89)  
7. [Operations & Runner App (Proof-of-Work)](#bookmark=id.yffmm56c033r)  
8. [Antigravity 2.0 Development Playbook](#bookmark=id.a6ezv6r2sd41)  
9. [Suggestions & Recommendations for Strategic Improvement](#bookmark=id.e02w7q616107)

### **1\. Executive Summary & Brand Identity**

* **Business Name:** CurbSitter.  
* **Core Promise & Taglines:** The business manages weekly bin rollout and returns so customers don't have to. Approved slogans include "Trash day, handled.", "Never miss trash day again.", and "Bins out. Bins back. Done.".  
* **Brand Aesthetic:** CurbSitter is positioned as the "Uber Black" of the trash concierge industry.  
* **Digital Design Rules:** The website relies on a high-end startup aesthetic utilizing deep onyx, midnight blue, electric cyan, and glassmorphism elements. To maintain premium sophistication, the brand utilizes high-contrast, editorial-style photography rather than distracting animations.

### **2\. Target Market & Demographic Focus**

* **Geographic Boundaries:** The initial focus is strictly tied to high-density gated communities in Prescott, Arizona. Active service areas are validated against specific zip codes (86301, 86302, 86303, 86304, 86305, 86315, 86318).  
* **Core Customer Base:** The service specifically targets affluent homeowners, short-term vacation rental owners, second-home owners ("snowbirds"), and an aging population (35.3% of Yavapai County residents are 65 or older).  
* **Target HOAs (B2B):** Marketing efforts prioritize communities with strict compliance covenants, including Prescott Lakes, Hassayampa Village, Talking Rock Ranch, American Ranch, Forest Trails, The Ranch at Prescott, Granville, and StoneRidge.

### **3\. Service Scope & Business Model**

* **Primary Service Focus:** Moving empty trash and recycling bins from the curb back to the designated storage area (such as a garage or side yard) within 24 hours of municipal collection.  
* **Strategic Exclusions:** Operations entirely exclude hazardous waste removal, bulk item hauling, deep bin cleaning, and general landscaping labor.  
* **Pet Waste Policy:** All residential backyard pet waste scooping has been permanently abandoned. Pet waste removal is strictly limited to lucrative B2B contracts for HOA-controlled common areas (e.g., dog parks, trails, clubhouses, and pet-waste stations).

### **4\. Pricing Strategy & Revenue Engine**

* **Payment Infrastructure:** The application uses Stripe natively.  
* **ACH Processing Optimization:** To minimize marginal costs on recurring subscriptions, the system prioritizes Stripe ACH Direct Debit (which carries a 0.8% fee capped at $5) over standard credit card processing (which charges 2.9% \+ 30¢).  
* **The Quarterly Incentive:** Customers receive a $10 discount if they commit to quarterly billing via ACH, heavily reducing long-term customer churn.  
* **HOA Enterprise Packages:** The B2B model provides scalable tiers, including an HOA Compliance Pilot, a Community-Wide Preferred Provider option, a Full HOA Contract, and a Common-Area Clean Space Add-On for pet waste.

### **5\. Marketing, Sales & Onboarding ("The Velvet Rope")**

* **Artificial Exclusivity:** The platform utilizes Mapbox API validation for service availability. Users entering an active zip code are routed directly to checkout, whereas those outside active density routes are placed on a waitlist to build hype and drive future expansion.  
* **The 4-Step Onboarding Flow:** To prevent form abandonment, the onboarding is split into four digestible steps with a top-mounted progress bar.  
  * *Step 1:* Zip code validation.  
  * *Step 2:* Contact information and property ingestion using JavaScript address autocomplete.  
  * *Step 3:* Service selection with dynamic, real-time pricing calculation.  
  * *Step 4:* Premium checkout highlighting the $5 autopay discount and Stripe integration.  
* **Content Loop Layout:** Pricing grids and waitlist interactions are structured as standalone sections on the main landing page to build SEO value and customer trust without bloating the conversion funnel.

### **6\. Technology Stack & Platform Architecture**

* **Frontend Framework:** Next.js (React) paired with Tailwind CSS to ensure blistering page speeds and maximum SEO optimization.  
* **Backend & Database:** Supabase (an open-source alternative to Firebase) serves as the engine for secure database management, user authentication, and real-time data syncing.  
* **Payment Gateway:** Stripe Elements handles secure, unified subscription billing.  
* **Geolocation:** Mapbox API drives route clustering and boundary validation.  
* **Messaging:** Twilio integration manages automated text message dispatches to customers.

### **7\. Operations & Runner App (Proof-of-Work)**

* **Mobile-First Field Terminal:** The "Runner App" is structured as a Progressive Web App (PWA), meaning route workers access it directly via a mobile browser, entirely bypassing native Apple App Store restrictions and fees.  
* **Proof-of-Work Automation:** Using the HTML5 capture="environment" attribute, the app seamlessly opens a worker's back-facing camera to capture timestamped photos of the serviced bins.  
* **Cloud Verification:** These photos are uploaded directly to the Supabase proof\_of\_work\_photos bucket.  
* **Customer Peace of Mind:** Upon successful upload, an automated SMS or email containing a secure link to the photo is dispatched to the homeowner, providing undeniable proof of service and justifying the premium price.

### **8\. Antigravity 2.0 Development Playbook**

* **Environment Initialization:** Since you are building without programming experience, use the standalone Google Antigravity 2.0 application powered by the Gemini 3.5 Flash engine.  
* **Strict Sandboxing:** Create a master project directory on your Ubuntu machine (e.g., \~/Projects/CurbSitter) to prevent the AI from interacting with sensitive system files.  
* **Security Guardrails:** Ensure that the "Agent Behavior \- Artifact Review Policy" is toggled to "Always Ask" (Review-Driven Development mode) so the agent never writes raw code to your hard drive without your explicit permission.  
* **Context Files (.md):** Antigravity relies on three structured markdown files to avoid hallucinations:  
  * AGENTS.md (Project rules and constraints placed in the root folder).  
  * .SKILL.md (Reusable, executable task templates).  
  * .WORKFLOW.md (Step-by-step automation recipes).  
* **Plugin Setup:** Enable the Supabase MCP, Stripe MCP, and Mapbox plugins within Antigravity so the agent references the most up-to-date SDKs and logic loops.

### **9\. Suggestions & Recommendations for Strategic Improvement**

Having reviewed the entirety of your pivots and master plan, here are two targeted suggestions to squeeze additional value out of your current trajectory:

1. **The "Property Pulse Check" Upsell:** Since you have correctly decided to drop residential dog waste removal, you have regained critical time on your routes. Because you are targeting a massive population of short-term rentals and snowbirds in Prescott, consider adding a high-margin "Exterior Pulse Check" upsell. For an additional $25/month, your runners simply look for visible exterior damage, open gates, or unauthorized vehicles while they move the bins, taking extra photos as needed (up to 50 photos) for the owner. It requires zero extra driving and leverages the fact that you are already standing on the property twice a week.  
2. **Hyper-Local SEO Pages:** Rather than just having a generic "Service Area" page, spin up dedicated landing pages for your Tier 1 HOAs (e.g., [*curbsitter.com/prescott-lakes*](https://curbsitter.com/prescott-lakes)). Fill these pages with the exact, publicly available HOA trash guidelines for that specific community. When new Prescott Lakes residents inevitably Google "Prescott Lakes trash bin rules," your premium concierge service will intercept them right as they discover the pain point.