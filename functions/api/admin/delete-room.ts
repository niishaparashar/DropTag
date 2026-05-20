import { createClient } from '@supabase/supabase-js'

type Env = {
  SUPABASE_URL?: string
  VITE_SUPABASE_URL?: string
  SUPABASE_SERVICE_ROLE_KEY?: string
  ADMIN_DELETE_TOKEN?: string
}

type DeleteRoomRequest = {
  tag?: string
}

type FileRow = {
  id: string
  storage_path: string
}

function normalizeTag(tag: string) {
  return tag.trim().replace(/^#/, '').toLowerCase()
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
    },
  })
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const supabaseUrl = env.SUPABASE_URL ?? env.VITE_SUPABASE_URL
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY
  const adminToken = env.ADMIN_DELETE_TOKEN

  if (!supabaseUrl || !serviceRoleKey || !adminToken) {
    return json({ error: 'Admin delete is not configured on this deployment.' }, 500)
  }

  const providedToken = request.headers.get('x-admin-token')
  if (!providedToken || providedToken !== adminToken) {
    return json({ error: 'Unauthorized.' }, 401)
  }

  const body = (await request.json().catch(() => null)) as DeleteRoomRequest | null
  const tag = body?.tag ? normalizeTag(body.tag) : ''

  if (!tag) {
    return json({ error: 'A valid tag is required.' }, 400)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const { data: tagRow, error: tagError } = await supabase.from('tags').select('id,name').eq('name', tag).maybeSingle()

  if (tagError) {
    return json({ error: tagError.message }, 500)
  }

  if (!tagRow) {
    return json({ error: `#${tag} was not found.` }, 404)
  }

  const { data: fileTagRows, error: fileTagError } = await supabase.from('file_tags').select('file_id').eq('tag_id', tagRow.id)

  if (fileTagError) {
    return json({ error: fileTagError.message }, 500)
  }

  const fileIds = Array.from(new Set((fileTagRows ?? []).map((row) => row.file_id)))

  if (fileIds.length > 0) {
    const { data: files, error: filesError } = await supabase.from('files').select('id,storage_path').in('id', fileIds).returns<FileRow[]>()

    if (filesError) {
      return json({ error: filesError.message }, 500)
    }

    const storagePaths = (files ?? []).map((file) => file.storage_path).filter(Boolean)

    const { error: deleteFileTagError } = await supabase.from('file_tags').delete().eq('tag_id', tagRow.id)

    if (deleteFileTagError) {
      return json({ error: deleteFileTagError.message }, 500)
    }

    if (storagePaths.length > 0) {
      const { error: storageError } = await supabase.storage.from('droptag-files').remove(storagePaths)

      if (storageError) {
        return json({ error: storageError.message }, 500)
      }
    }

    const { error: deleteFilesError } = await supabase.from('files').delete().in('id', fileIds)

    if (deleteFilesError) {
      return json({ error: deleteFilesError.message }, 500)
    }
  }

  const { error: deleteTagError } = await supabase.from('tags').delete().eq('id', tagRow.id)

  if (deleteTagError) {
    return json({ error: deleteTagError.message }, 500)
  }

  return json({ ok: true, deletedTag: tag })
}