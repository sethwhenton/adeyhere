-- DANGER: This script wipes all data and resets the schema.
-- It uses CASCADE to remove any dependent views or foreign keys.

-- 1. DROP EXISTING TABLES AND VIEWS (Reset)
drop table if exists public.messages cascade;
drop table if exists public.participants cascade;
drop table if exists public.past_events cascade;
drop table if exists public.spaces cascade;
-- Also drop the view explicitly if needed, but CASCADE above should handle it
drop view if exists public.space_analytics; 


-- 2. RE-CREATE TABLES WITH FIXES

-- PROFILES (Ensure it exists)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  display_name text,
  avatar text,
  is_ghost boolean default false,
  location jsonb, 
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.profiles enable row level security;
-- Re-apply profile policies just in case
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);

drop policy if exists "Users can insert their own profile." on public.profiles;
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update their own profile." on public.profiles;
create policy "Users can update their own profile." on public.profiles for update using (auth.uid() = id);


-- SPACES
create table public.spaces (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  host_id uuid references public.profiles(id) not null,
  center_lat float not null,
  center_lng float not null,
  radius float not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  expires_at timestamp with time zone not null,
  description text
);
alter table public.spaces enable row level security;

create policy "Spaces are viewable by everyone." on public.spaces for select using (true);
create policy "Authenticated users can create spaces." on public.spaces for insert with check (auth.role() = 'authenticated');
-- *** KEY FIX: ALLOW HOSTS TO DELETE ***
create policy "Hosts can delete their own spaces." on public.spaces for delete using (auth.uid() = host_id);


-- PARTICIPANTS
create table public.participants (
  id uuid default gen_random_uuid() primary key,
  space_id uuid references public.spaces(id) on delete cascade not null, -- *** KEY FIX: CASCADE ***
  user_id uuid references public.profiles(id) not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()),
  unique(space_id, user_id)
);
alter table public.participants enable row level security;

create policy "Participants are viewable by everyone." on public.participants for select using (true);
create policy "Users can join spaces." on public.participants for insert with check (auth.uid() = user_id);
create policy "Users can leave spaces." on public.participants for delete using (auth.uid() = user_id);


-- MESSAGES
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  space_id uuid references public.spaces(id) on delete cascade not null, -- *** KEY FIX: CASCADE ***
  user_id uuid references public.profiles(id) not null,
  content text not null,
  is_broadcast boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.messages enable row level security;

create policy "Messages are viewable by everyone in the space" on public.messages for select using (true);
create policy "Users can insert messages" on public.messages for insert with check (auth.uid() = user_id);


-- PAST EVENTS
create table if not exists public.past_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  space_id uuid, 
  space_name text,
  visited_at timestamp with time zone default timezone('utc'::text, now()),
  left_at timestamp with time zone
);
alter table public.past_events enable row level security;
create policy "Users can see own history" on public.past_events for select using (auth.uid() = user_id);
create policy "Users can insert history" on public.past_events for insert with check (auth.uid() = user_id);


-- RE-CREATE ANALYTICS VIEW (Since we dropped it)
create or replace view public.space_analytics as
select 
  s.id as space_id,
  count(distinct p.user_id) as total_participants,
  count(distinct m.id) as total_messages
from public.spaces s
left join public.participants p on s.id = p.space_id
left join public.messages m on s.id = m.space_id
group by s.id;
