-- Adey Here Supabase Schema

-- PROFILES
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  display_name text,
  avatar text,
  is_ghost boolean default false,
  location jsonb, -- {lat: 123, lng: 123}
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile." on public.profiles for update using (auth.uid() = id);

-- SPACES
create table if not exists public.spaces (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  host_id uuid references public.profiles(id) not null,
  center_lat float not null,
  center_lng float not null,
  radius float not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  expires_at timestamp with time zone not null
);
alter table public.spaces enable row level security;
create policy "Spaces are viewable by everyone." on public.spaces for select using (true);
create policy "Authenticated users can create spaces." on public.spaces for insert with check (auth.role() = 'authenticated');

-- PARTICIPANTS (Many-to-Many: Users <-> Spaces)
create table if not exists public.participants (
  id uuid default gen_random_uuid() primary key,
  space_id uuid references public.spaces(id) not null,
  user_id uuid references public.profiles(id) not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()),
  unique(space_id, user_id)
);
alter table public.participants enable row level security;
create policy "Participants are viewable by everyone." on public.participants for select using (true);
create policy "Users can join spaces." on public.participants for insert with check (auth.uid() = user_id);

-- MESSAGES
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  space_id uuid references public.spaces(id) not null,
  user_id uuid references public.profiles(id) not null,
  content text not null,
  is_broadcast boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table public.messages enable row level security;
create policy "Messages are viewable by everyone in the space" on public.messages for select using (true);
create policy "Users can insert messages" on public.messages for insert with check (auth.uid() = user_id);

-- AUTOMATION: Create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar)
  values (new.id, new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'avatar');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
