# BACKEND_STRUCTURE.md: Core SQL Relational Blueprint & API Contract

## 1. Database Relational Migration Layer

```sql
-- EXTENSION PREREQUISITES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USER IDENTITY STORAGE
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('customer', 'runner', 'admin')),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    stripe_customer_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROPERTY INFRASTRUCTURE LAYOUT
CREATE TABLE public.properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Prescott',
    zip_code TEXT NOT NULL,
    property_type TEXT NOT NULL CHECK (property_type IN ('main', 'second', 'str', 'hoa')),
    bin_coordinates JSONB DEFAULT NULL, -- Logged via navigator.geolocation on first service
    gate_code TEXT DEFAULT NULL,
    lockbox_combination TEXT DEFAULT NULL,
    custom_instructions TEXT DEFAULT NULL,
    is_first_visit BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RECURRING TRANSACTION TRACKER
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    tier TEXT NOT NULL CHECK (tier IN ('starter', 'premium', 'business', 'hoa_bulk')),
    billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'quarterly')),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('credit_card', 'ach')),
    status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'cancelled')),
    referral_code_applied TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FIELD RUNNER TIMEKEEPING ENGINE
CREATE TABLE public.runner_shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    runner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    clock_in TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    clock_out TIMESTAMPTZ DEFAULT NULL,
    odometer_start INTEGER NOT NULL,
    odometer_end INTEGER DEFAULT NULL,
    shift_status TEXT NOT NULL CHECK (shift_status IN ('active', 'break', 'completed'))
);

-- OPERATIONAL SERVICE LOG RECORDS
CREATE TABLE public.service_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    runner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    shift_id UUID REFERENCES public.runner_shifts(id) ON DELETE SET NULL,
    service_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    photo_urls TEXT[] DEFAULT '{}', -- Supports multi-photo and Home Watch arrays (up to 50 assets)
    exception_logged TEXT DEFAULT NULL CHECK (exception_logged IN ('gate_locked', 'blocked_access', 'overflow_trash', 'wildlife_mess', 'none')),
    exception_resolved BOOLEAN NOT NULL DEFAULT false,
    surcharge_applied NUMERIC(10, 2) DEFAULT 0.00,
    surcharge_approved BOOLEAN NOT NULL DEFAULT false,
    gps_verification JSONB NOT NULL, -- Captures exact runner capture coordinates
    status TEXT NOT NULL CHECK (status IN ('completed', 'exception', 'skipped'))
);

-- VIRAL REFERRAL DATA STORE
CREATE TABLE public.referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    referred_email_or_phone TEXT NOT NULL,
    invite_zip TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'converted', 'waitlisted')),
    reward_processed BOOLEAN NOT NULL DEFAULT false
);

## 2. Field Submissions Processing API Contract

### `submitServiceStop(payload: FormData)`

**Input Parameters:**
* `propertyId`: UUID
* `shiftId`: UUID
* `photoAssets`: Blob / File Array
* `exceptionType`: Text String (`gate_locked`, `overflow_trash`, etc.)
* `surchargeVolume`: Integer (Number of overflow containers)
* `runnerLat`: Float Vector
* `runnerLng`: Float Vector

**Internal Processing Order Logic:**

1. Authenticates current session via Supabase secure access validation tokens.
2. Confirms proximity threshold by running distance calculations matching `runnerLat/Lng` against target parameters stored inside the matching `properties.bin_coordinates` record.
3. Iterates over `photoAssets` array data, parsing filenames to match unified structures (`proof_[prop]_[timestamp].jpg`), streaming assets directly to the public cloud bucket framework.
4. If `exceptionType == 'overflow_trash'`, inserts structured surcharge metrics (`surcharge_applied: 10.00 * surchargeVolume`) and stops automated clear states. Triggers Twilio dispatch modules running single-click transaction authorization tokens to customer channels.
5. Resolves active routing queue milestones, updating metrics feeds, and broadcasting standard automated service complete messages immediately.
