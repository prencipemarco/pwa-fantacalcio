
-- Create a table for public profiles (synced from auth.users)
create table if not exists public.users (
  id uuid references auth.users not null primary key,
  email text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.users enable row level security;

create policy "Public profiles are viewable by everyone."
  on users for select
  using ( true );

create policy "Users can insert their own profile."
  on users for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on users for update
  using ( auth.uid() = id );

-- Trigger to sync auth.users to public.users on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, created_at)
  values (new.id, new.email, new.created_at);
  return new;
end;
$$;

-- Drop trigger if exists to recreate
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill existing users (Optional, but good for dev)
-- Note: This usually requires running via dashboard if we don't have direct access to auth.users from here, 
-- but this SQL is intended to be run in Supabase SQL Editor.
