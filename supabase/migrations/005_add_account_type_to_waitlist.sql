-- Alter waitlist table to support Progressive Concierge waitlist fields
alter table public.waitlist
  add column if not exists account_type text,
  add column if not exists portfolio_size text;
