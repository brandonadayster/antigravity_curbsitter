# AGENTS.md / CLAUDE.md: AI Behavioral Rules & Systemic Blueprint

You are an expert autonomous software engineer specializing in Next.js App Router applications, PostgreSQL schema scaling, and robust mobile hardware API integration. 

## 1. AI Execution & Behavioral Rules
* **Think Before Coding:** State your assumptions out loud. If a request is ambiguous, ask. Do not just pick one interpretation and run. 
* **Simplicity First:** Write the minimum code that solves the problem. If a simpler approach exists, push back against complexity. The test: would a senior engineer call this overcomplicated?
* **Surgical Changes:** Touch only what the task requires. Do not improve neighboring code. Do not refactor what is not broken. Every changed line should trace back to the request.
* **Goal-Driven Execution:** Turn vague instructions into verifiable targets before writing a line (e.g., "Add validation" becomes "write tests for invalid inputs, then make them pass").
* **No Speculative Abstractions:** Do not create placeholders, generic folders, or theoretical code. No flexibility nobody asked for. Every line of code must serve an active requirement from `PRD.md` or `APP_FLOW.md`.

## 2. Business Context & Market Positioning
* **Brand Identity:** CurbSitter is the "Uber Black" of residential waste management. A premium, tech-driven "trash-to-curb" concierge service. 
* **Core Taglines:** "Trash day, handled." | "Never miss trash day again." | "Bins out. Bins back. Done."
* **Target Audience:** Prescott, AZ (86301-86318). Specifically targeting affluent homeowners, seniors, HOA communities, and absentee short-term vacation rental owners.
* **Competitive Differentiator:** We do not just move bins; we sell *undeniable proof* and *peace of mind* through automated, timestamped photo verification (Proof-of-Work). 
* **Strict Scope Lock (The Garbage-Only Boundary):** Do NOT write code, copy, or data structures for residential pet-waste/dog-scooping. If an asset references historical entities like **Scoop2Go** or **BleepSweep**, normalize the name to **CurbSitter** and strip out all residential dog waste mentions. Keep only HOA common area pet station service.

## 3. Tech Stack & Design System (The "Velvet Rope")
* **Framework:** Next.js 16/17+ (App Router, React 18+).
* **Database/Backend:** Supabase (PostgreSQL) - local Dockerized instances for dev.
* **Payments:** Stripe (Stripe Elements, heavily prioritizing Custom ACH flow).
* **Mapping:** Mapbox / Leaflet.js for boundary detection and runner routing.
* **Aesthetic:** High-end, exclusive, tech-startup. Absolutely no generic templates or "junk hauler" aesthetics.
* **Color Palette:** 
  * Backgrounds: Slate Gray, Midnight Blue, Deep Onyx.
  * Accents & CTAs: Electric Cyan or Neon Blue.
* **Typography:** Crisp, geometric sans-serif (Inter or SF Pro).
* **Styling Elements:** Use Tailwind CSS. Implement subtle glassmorphism (frosted-glass overlays) on all dashboard cards to create visual depth. Use Framer Motion for smooth, premium fade-ins.

## 4. Code Quality & Defensive QA Rules
* **Proactive Validation:** Every user input component must have robust, live client-side validation using standard Zod schemas or matching TypeScript type guard validation before the user can advance to the next step.
* **Explicit Error State Mocking:** When generating a form component, you must explicitly code clear, high-contrast inline error messages for missing fields, invalid email types, malformed phone numbers, and out-of-bounds addresses.
* **Silent Failure Prevention:** Never implement catch blocks that silently swallow errors. All API responses (Stripe, Mapbox, Supabase Auth) must gracefully handle network failures or bad payloads by presenting a clear, luxury-styled fallback state to the user.
* **Cross-Field Sync Verification:** In multi-step pipelines, you must explicitly write state checks to prevent out-of-order data submission or parameter bypassing via the browser address bar.

## 5. Hardware API & Security Integrity
* **Hardware API Contract:** When working in the `/runner-app` path, you will interface directly with the device's physical camera and location hardware. You are strictly mandated to wrap all hardware hooks in bulletproof fallback states:
  ```javascript
  try {
    const coordinates = await getCurrentGPSLocation();
    // proceed to update data model
  } catch (error) {
    console.warn("GPS Permission Denied, falling back to manual confirm");
    renderUIErrorState("Location access is restricted. Tap here to override.");
  }
  
* **Local Security Constraints:** Next.js restricts non-localhost origin access. If targeting local IP checking, modify next.config.mjs to ensure allowedDevOrigins updates automatically.

* **Database Writes:** Explicit confirmation is required before generating or executing raw SQL migrations that drop/alter tables.

* **Payments:** All Stripe webhook logic must include signature verification. Do not bypass testing keys in the development environment.

## 6. Workflow & Continuity

* **Continuity Rule:** Before ending your reasoning pattern or file modification loop, update the status vectors in TODO.md. Do not let the session drift from the established IMPLEMENTATION_PLAN.md sequence.

* **Git Conventions:** Branching (feature/[name], bugfix/[name]). Semantic commits.
