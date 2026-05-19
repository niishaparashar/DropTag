create extension if not exists "pgcrypto";

create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  storage_path text not null,
  public_url text not null,
  file_type text not null,
  file_size bigint not null,
  uploaded_by uuid references auth.users(id) on delete set null,
  download_count integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz default now(),
  constraint tags_name_normalized check (name = lower(name) and name !~ '^#')
);

create table if not exists public.file_tags (
  file_id uuid references public.files(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (file_id, tag_id)
);

create or replace function public.increment_download_count(file_id_input uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.files
  set download_count = coalesce(download_count, 0) + 1
  where id = file_id_input;
$$;

grant execute on function public.increment_download_count(uuid) to anon, authenticated;

alter table public.files enable row level security;
alter table public.tags enable row level security;
alter table public.file_tags enable row level security;

create policy "Anyone can read files"
on public.files for select
using (true);

create policy "Anyone can insert files"
on public.files for insert
with check (true);

create policy "Owners can delete files"
on public.files for delete
using (auth.uid() = uploaded_by);

create policy "Anyone can read tags"
on public.tags for select
using (true);

create policy "Anyone can insert tags"
on public.tags for insert
with check (true);

create policy "Anyone can read file tags"
on public.file_tags for select
using (true);

create policy "Anyone can insert file tags"
on public.file_tags for insert
with check (true);

create index if not exists files_created_at_idx on public.files (created_at desc);
create index if not exists tags_name_idx on public.tags (name);
create index if not exists file_tags_tag_id_idx on public.file_tags (tag_id);
create index if not exists file_tags_file_id_idx on public.file_tags (file_id);
