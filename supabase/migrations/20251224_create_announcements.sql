-- Create announcements table
create table if not exists announcements (
  id uuid default gen_random_uuid() primary key,
  space_id uuid references spaces(id) on delete cascade not null,
  host_id uuid references profiles(id) not null,
  content text not null,
  image_url text,
  link_url text,
  link_text text,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table announcements enable row level security;

-- Allow everyone to read announcements
create policy "Anyone can view announcements"
  on announcements for select
  using (true);

-- Only the host can create announcements
create policy "Hosts can create announcements"
  on announcements for insert
  with check (auth.uid() = host_id);

-- Create index for faster queries
create index if not exists announcements_space_id_idx on announcements(space_id);
create index if not exists announcements_created_at_idx on announcements(created_at desc);
