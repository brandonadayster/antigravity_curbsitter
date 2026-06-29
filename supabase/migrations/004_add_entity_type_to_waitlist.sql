-- Add entity_type column to waitlist table
alter table public.waitlist
  add column if not exists entity_type text;
