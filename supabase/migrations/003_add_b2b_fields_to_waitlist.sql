-- Alter waitlist table to support B2B lead qualification fields
alter table public.waitlist
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists user_role text,
  add column if not exists organization_name text;
