# AI_STATE: CurbSitter

## 1. The Goal
Develop a high-end, tech-enabled residential trash rollout concierge service (CurbSitter). 
Current Priority: Implement the "Give $20, Get $20" localized referral loop and waitlist dashboard gamification.

## 2. The Tech Stack
* Next.js (App Router)
* Supabase (Auth, PostgreSQL, RLS)
* Stripe (Billing, Customer Balances, Webhooks)
* Tailwind CSS
* Antigravity Client (AI Code Generator)

## 3. Current Architecture State
* Core UI elements (Glassmorphism, Framer Motion animations) are built.
* Project uses standard Next.js `src/app` directory structure.
* Stripe webhook route exists at `src/app/api/webhooks/stripe/route.ts`.
* Customer dashboard scaffolding exists at `src/app/customer-dashboard`.

## 4. Database Schema (New Referral & Waitlist Tables)
CREATE TYPE route_status AS ENUM ('collecting', 'active');
CREATE TYPE user_status AS ENUM ('waitlist', 'active', 'paused');

CREATE TABLE routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  target_capacity INT NOT NULL,
  status route_status DEFAULT 'collecting',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  status user_status DEFAULT 'waitlist',
  route_id UUID REFERENCES routes(id),
  stripe_customer_id TEXT,
  referred_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE referral_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES profiles(id) NOT NULL,
  new_user_id UUID REFERENCES profiles(id) NOT NULL,
  amount INT DEFAULT 20,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

## 5. Active Task
Implement strict cryptographic signature verification on the Stripe webhook (src/app/api/webhooks/stripe/route.ts) to process checkout.session.completed events, issue -$20 Customer Balance Transactions to the referrer, and log the transaction in the referral_credits table.
