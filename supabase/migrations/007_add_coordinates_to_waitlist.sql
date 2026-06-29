-- Alter waitlist table to support physical address strings and geolocation coordinates
alter table public.waitlist
  add column if not exists address text,
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;
