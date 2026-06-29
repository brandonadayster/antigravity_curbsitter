-- EXTENSION PREREQUISITES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USER IDENTITY STORAGE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('customer', 'runner', 'admin')),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    stripe_customer_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ALTER PROPERTIES TABLE FOR RELATION AND ADDITIONAL COLUMNS
ALTER TABLE public.properties 
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS city TEXT NOT NULL DEFAULT 'Prescott',
    ADD COLUMN IF NOT EXISTS zip_code TEXT NOT NULL DEFAULT '86301',
    ADD COLUMN IF NOT EXISTS property_type TEXT DEFAULT 'residential' CHECK (property_type IN ('main', 'second', 'str', 'hoa', 'residential')),
    ADD COLUMN IF NOT EXISTS bin_coordinates JSONB DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS lockbox_combination TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS custom_instructions TEXT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS is_first_visit BOOLEAN NOT NULL DEFAULT true;

-- 3. RECURRING TRANSACTION TRACKER
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    tier TEXT NOT NULL CHECK (tier IN ('starter', 'premium', 'business', 'hoa_bulk')),
    billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'quarterly')),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('credit_card', 'ach')),
    status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'cancelled')),
    referral_code_applied TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FIELD RUNNER TIMEKEEPING ENGINE
CREATE TABLE IF NOT EXISTS public.runner_shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    runner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    clock_in TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    clock_out TIMESTAMPTZ DEFAULT NULL,
    odometer_start INTEGER NOT NULL,
    odometer_end INTEGER DEFAULT NULL,
    shift_status TEXT NOT NULL CHECK (shift_status IN ('active', 'break', 'completed'))
);

-- 5. ALTER SERVICE LOGS TABLE FOR RELATION AND ADDITIONAL COLUMNS
-- Note: Making references to public.users nullable to maintain backwards compatibility
ALTER TABLE public.service_logs
    ADD COLUMN IF NOT EXISTS runner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS shift_id UUID REFERENCES public.runner_shifts(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS service_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS photo_urls TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS exception_logged TEXT DEFAULT NULL CHECK (exception_logged IN ('gate_locked', 'blocked_access', 'overflow_trash', 'wildlife_mess', 'none')),
    ADD COLUMN IF NOT EXISTS exception_resolved BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS surcharge_applied NUMERIC(10, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS surcharge_approved BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS gps_verification JSONB DEFAULT NULL;

-- 6. VIRAL REFERRAL DATA STORE
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    referred_email_or_phone TEXT NOT NULL,
    invite_zip TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'converted', 'waitlisted')),
    reward_processed BOOLEAN NOT NULL DEFAULT false
);
