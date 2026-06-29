-- Make zip_code column nullable to support B2B portfolio leads
alter table public.waitlist
  alter column zip_code drop not null;
