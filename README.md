# CurbSitter
**The Premium "Uber Black" Trash Concierge Service Platform.**

## System Overview
CurbSitter is a robust, high-performance web-application designed to orchestrate premium residential and commercial trash-bin rollout services in the Prescott, AZ Quad-City area. Built using Next.js, Tailwind CSS, and Supabase, it optimizes localized routing density, coordinates automated client messaging loops via Twilio SMS, and acts as an autonomous sales asset through a conversion-oriented 4-step onboarding script.

## Technical Directory Map
* \`/src/app/\` - Next.js App Router folders (Landing layout, Onboarding funnel, Portal gateways).
* \`/src/app/runner-app/\` - High-contrast, mobile-first field service terminal.
* **\`/src/app/actions/\`:** Server Actions handling direct Supabase mutations and image stream processing.
* **\`/src/shared/services/\`:** Extracted modules for Stripe checkout APIs and Twilio SMS microservices.

## Environment Architecture Configuration
Ensure your root environment file (\`.env.local\`) matches the following properties:
\\\`\\\`\\\`env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-webhook-signature
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-number
NEXT_PUBLIC_APP_URL=http://localhost:3000
\\\`\\\`\\\`

## Mandatory Deployment Step
Log in to your Supabase web portal, open **Storage**, and manually create a public bucket named \`proof_of_work_photos\`. Secure your folder structures with public read permissions to enable instantaneous customer SMS link retrieval.

# CurbSitter Platform Workspace

## Stack Blueprint
* **Framework:** Next.js 14+ (App Router strictly enforced)
* **Backend/Database:** Supabase (PostgreSQL, Auth, and Object Storage)
* **Payments:** Stripe Node SDK (ACH Optimized)
* **Communications:** Twilio API Services (SMS Notifications)
* **Styling:** Tailwind CSS + Framer Motion (Glassmorphism design system)

## AI Agent Directives
**This repository is optimized for autonomous agents (Claude Code, Antigravity 2.0)**
* Always read AGENTS.md, README.md and TODO.md before writing code.
* Always track state via TODO.md.
