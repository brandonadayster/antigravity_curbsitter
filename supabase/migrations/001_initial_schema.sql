-- Create properties table
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid, -- Reference to the customer user
  address text not null,
  gate_code text,
  bin_location text not null,
  special_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create service_logs table
create table if not exists public.service_logs (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade not null,
  runner_id uuid, -- Reference to the route worker user
  status text not null default 'completed',
  photo_url text,
  lat double precision,
  lng double precision,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on both tables
alter table public.properties enable row level security;
alter table public.service_logs enable row level security;

-- RLS Policies for properties
create policy "Allow read access for authenticated users to properties"
  on public.properties for select
  using (true);

create policy "Allow insert access for authenticated users to properties"
  on public.properties for insert
  with check (true);

-- RLS Policies for service_logs
create policy "Allow read access for authenticated users to service_logs"
  on public.service_logs for select
  using (true);

create policy "Allow insert access for authenticated users to service_logs"
  on public.service_logs for insert
  with check (true);

-- Scaffolding the proof_of_work_photos bucket in storage.buckets
insert into storage.buckets (id, name, public)
values ('proof_of_work_photos', 'proof_of_work_photos', true)
on conflict (id) do nothing;

-- Storage RLS policies for proof_of_work_photos bucket
create policy "Allow public read access to proof_of_work_photos"
  on storage.objects for select
  using (bucket_id = 'proof_of_work_photos');

create policy "Allow insert access to proof_of_work_photos"
  on storage.objects for insert
  with check (bucket_id = 'proof_of_work_photos');
