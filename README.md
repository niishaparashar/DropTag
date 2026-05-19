# DropTag

DropTag is a hashtag-based file sharing web application. Users upload files and tag them with hashtags instead of organizing into folders. Anyone with the hashtag can discover and download those files. No accounts required for basic usage. Think of it as a tagboard for files.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS v3 |
| Backend | Supabase PostgreSQL |
| Storage | Supabase Storage |
| Auth | Supabase Auth, optional for upload history |
| State | Zustand |
| File input | react-dropzone |
| Deployment | Cloudflare Pages |

## Setup

```bash
git clone <your-repo-url>
cd droptag
cp .env.example .env
npm install
npm run dev
```

Fill `.env` with your Supabase project values:

```bash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Deploy to Cloudflare Pages

Cloudflare Pages is a good free fit for this app because it serves the built Vite output and supports custom domains.

### 1) Push to GitHub

Make sure the repository is on GitHub.

### 2) Create a Cloudflare Pages project

In Cloudflare Dashboard:
- Go to **Workers & Pages** → **Create application** → **Pages**
- Connect your GitHub repo
- Set the build settings:
  - **Framework preset:** `Vite`
  - **Build command:** `npm run build`
  - **Build output directory:** `dist`

### 3) Add environment variables

Add these in the Pages project settings:

```bash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4) Deploy

Cloudflare Pages will build and publish the app automatically on every push.

### 5) Connect your `.cloud` domain

For a simple public domain:
- Buy or transfer your domain to Cloudflare Registrar, or point your domain’s nameservers to Cloudflare
- In the Pages project, open **Custom domains**
- Add your domain, for example `droptag.cloud`
- Optionally add `www.droptag.cloud` and redirect it to the root domain

Cloudflare will automatically provision HTTPS for the custom domain.

## Supabase Setup

Create a Supabase project, then run this SQL in the SQL editor.

```sql
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
```

Create a public storage bucket named `droptag-files` with a 50MB file size limit. Allow all MIME types.

Storage policies:

```sql
create policy "Public read access for droptag files"
on storage.objects for select
using (bucket_id = 'droptag-files');

create policy "Anyone can upload droptag files"
on storage.objects for insert
with check (bucket_id = 'droptag-files');
```

## Features

- Drag-and-drop upload with image preview and file type icons
- Hashtag pill input with normalization and duplicate prevention
- Anonymous uploads plus nullable `uploaded_by` for optional auth history
- Hashtag discovery pages at `/tag/:tagname`
- Responsive file grid with loading skeletons and empty states
- Trending tags from file associations in the last 7 days
- Download button that increments `download_count` and opens the public file URL

## Screenshots

Add screenshots here after deploying or running the app locally.

## Live Demo

Cloudflare Pages URL: `https://your-project.pages.dev`
