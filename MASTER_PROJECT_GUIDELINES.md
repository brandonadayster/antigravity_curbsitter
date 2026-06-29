# MASTER PROJECT GUIDELINES & PLANNING DOCUMENT

## Executive Summary
CurbSitter is the "Uber Black" of residential trash concierge services in Prescott, Arizona. Born from the strategic evolution of Scoop2Go and BleepSweep, CurbSitter has shed the operational friction of residential pet waste removal to focus purely on high-margin, high-density logistics: moving trash bins to the curb and back. We target affluent homeowners, aging populations, short-term rental (STR) owners, and HOAs. We do not sell "taking the trash out"—we sell reliability, HOA compliance, physical safety, and the undeniable peace of mind delivered via automated GPS-stamped photo proof. 

**Brand Promise:** "Trash day, handled." | "Bins out. Bins back. Done."

## 1. Brand & Operations Profile
* **Brand Identity & Tone:** Premium, local, highly reliable, and technologically advanced. Tone is neighborly yet elite—never corporate or industrial.
* **Visual Aesthetic:** Deep Onyx (\`#0A0F1D\`) and Slate Gray backgrounds, Midnight Blue accents, and Electric Cyan/Neon Blue CTAs. Heavy use of glassmorphism (frosted glass overlays, 1px subtle borders) and scroll-driven motion to simulate a high-end SaaS experience.
* **Service Area & Waitlist Logic:** Exclusively Prescott, AZ (Zip codes: 86301, 86302, 86303, 86304, 86305, 86315, 86318). Any zip code outside this array triggers a premium "Velvet Rope" waitlist UI to maintain artificial exclusivity and build future route density.
* **Operational Density:** Stop times must be minimized. The service is strictly tethered to municipal waste schedules.
* **Proof-of-Work Engine:** The core differentiator. Runners use a web-based mobile terminal to photograph bins securely returned to the house. This immediately triggers an SMS to the customer, neutralizing absentee-owner anxiety.

## 2. Comprehensive Subscription & Add-On Matrix

| Tier / Service | Target Audience | Pricing Structure / Rules | Business Metrics |
| :--- | :--- | :--- | :--- |
| **Residential Basic Plan** 
| Ideal for seniors & busy professionals 
| **Starting at $49 / property / month, billed [ (monthly), (quarterly) ]**
<br>• Service for up to 2 cans
<br>• Cans rolled to the curb and back
<br>• One collection day per week
<br>• 24/7 client dashboard access
<br>• Proof-of-work photos
<br>• Optional SMS notifications
<br>• Service is month-to-month
<br>• Includes **FREE javalenia cleanup**
| Baseline recurring margin; optimized strictly via geographical clustering to match municipal routes. |
  
| **Residential Premium Plan** 
| Ideal if trash and recycle on separate days
| **$65 / property / month, billed [ (monthly), (quarterly) ]**
<br>• All starter plan features, plus:
<br>• HOA violation protection
<br>• Service for up to 4 cans
<br>• Up to 2 collection days per week
<br>• Discounted on-demand services
<br>• Next day route addition
<br>• Service is month-to-month
<br>• Includes **FREE javalenia cleanup**
| Fully unlocked photo streams and automated Twilio alert scripts. High margin. Eliminates municipal fines/negative reviews for out-of-state STR hosts. Costs a fraction of a single night's booking fee. |


| **Business Starter Plan** 
| Ideal for vacation rentals, gated and HOA estates 
| **$79 / property / month, billed [ (monthly), (quarterly) ]**
<br>• All residential premium plan features, plus:
<br>• Service for up to 6 cans
<br>• Multi-user account access
<br>• Discounted on-demand services
<br>• Service is month-to-month
<br>• Includes **FREE javalenia cleanup**
| Multi-unit density anchor points.  | 

| **Business Premium Plan** 
| Ideal for HOA Communities Condo Associations & Managed Portfolios
| **Call for Pricing. For 5+ properties, custom billing**
<br>• All business starter plan features, plus:
<br>• Highest priority service schedules
<br>• Community-wide or street-level deployment
<br>• Multi-user account access
<br>• Discounted on-demand services
<br>• Service is month-to-month
<br>• Includes **FREE javalenia cleanup**
|  Custom door-to-door bulk volume matrixing for property management firms. Ultimate route density. Secures 100% of community properties in a single operational sweep. |

| **B2B Add-On: Pet Waste**
| HOAs & Property Managers 
| **$175 / month per station** 
| Maintenance of common-area trailheads, dog parks, and walking paths. Emptying waste baskets and restocking dispenser bags. *Zero residential backyard access.* |

| **On-Demand: CanNow** | Active Subscribers | **$15 / instance** | Same-day or immediate deployment for emergency rollout requests. |


| **Surcharges** | Active Subscribers | **$10 per overflow bag** | Automated photo upload by runner flags overflow waste. Fires SMS token for customer click-to-approve invoice. |
  * **If additional steps are required to complete service (i.e. gate code required for property access (+$5), garage code access (+$5), long driveway of 50ft-100ft (+$5), long driveway of +100ft (+$10), unpaved driveway (+$5), locked side gate access (+$5), etc.) additional service fees/surcharges may apply.
    * **Important Note**: Don't show these additional charges on the main pricing cards - only show them during the onboarding form completion (with a live invoice calculator displays in real-time how the optional add-on services and surcharges will affect the total price.




### The Payment Loop & ACH Capital Optimization
To optimize revenue operations against card transaction drag, CurbSitter actively prioritizes automated Clearing House processing:
* **The Card Drain:** Traditional credit cards extract a punishing 2.9% + 30¢ flat fee per transaction. 
* **The ACH Shield:** Stripe ACH Direct Debit scales down processing expenses to 0.8% with a strict ceiling cap at $5.00. 
* **Incentivization Framework:**
  * **Visual Selection Engine:** The onboarding flow prominently highlights an instant **$10 discount** for electing Quarterly ACH billing, combined with a **$5 discount** for automated fallback settings.
  * **Retention Layer:** Bank credentials do not expire or roll over like debit/credit cards, structurally reducing churn from involuntary transaction failures.

## 3. Project Retrospective & Strategic Guardrails
* **The Twilio SMS Limit Trap:** Ensure your Twilio account is upgraded from a "Trial" account to an "Active" paid layout before running end-to-end integration checks. Trial watermarks truncate lengthy secure database tokens appended to photo links, triggering network drops.
* **The Supabase Bucket Phantom Bug:** Never attempt to orchestrate PostgreSQL scripts to initialize complex media asset buckets. Manually create the public storage container titled \`proof_of_work_photos\` inside your browser dashboard.
* **The Mobile Hardware Security Crash:** Modern mobile secure contexts strictly isolate \`navigator.geolocation\` and environmental hardware inputs. Local testing over network IPs (e.g., \`http://192.168.x.x:3000\`) will crash text render loops unless explicitly authorized. Ensure \`allowedDevOrigins\` in \`next.config.mjs\` incorporates your current development IP. Include robust error catch fallbacks in the runner workspace.
* **Scope Isolation Rule:** Protect operational margin at all costs. Do not let AI components alter interfaces to mention residential animal cleanup or backyard projects. Maintain a laser focus on rapid, sequential bin rollout routing.
