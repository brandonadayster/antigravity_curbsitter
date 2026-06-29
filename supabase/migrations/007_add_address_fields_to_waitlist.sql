-- Add address and lat/lng coordinates to waitlist table
alter table public.waitlist
  add column if not exists address text,
  add column if not exists lat double precision,
  add column if not exists lng double precision;
