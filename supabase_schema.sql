-- Create Profiles Table
create table public.profiles (
    cedula text not null primary key,
    name text not null,
    phone text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- Create Visits Table
create table public.visits (
    id uuid default gen_random_uuid() primary key,
    user_cedula text references public.profiles(cedula) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- Create Redemptions Table
create table public.redemptions (
    id uuid default gen_random_uuid() primary key,
    user_cedula text references public.profiles(cedula) not null,
    level_id integer not null,
    redeemed_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- Enable Row Level Security (RLS)
-- For MVP, we will allow public read/write since we are using anonymous key from client side
-- In production, you'd want stricter policies (e.g. only allow inserting visits via server function)
alter table public.profiles enable row level security;
alter table public.visits enable row level security;
alter table public.redemptions enable row level security;
create policy "Allow public access to profiles" on public.profiles for all using (true) with check (true);
create policy "Allow public access to visits" on public.visits for all using (true) with check (true);
create policy "Allow public access to redemptions" on public.redemptions for all using (true) with check (true);