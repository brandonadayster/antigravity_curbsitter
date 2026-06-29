-- Create waitlist table
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  phone text,
  zip_code text not null,
  property_type text,
  status text not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.waitlist enable row level security;

-- Allow public insert access so unregistered prospects can join
create policy "Allow public insert to waitlist"
  on public.waitlist for insert
  with check (true);

-- Allow select access for waitlist entries
create policy "Allow read access to waitlist"
  on public.waitlist for select
  using (true);
