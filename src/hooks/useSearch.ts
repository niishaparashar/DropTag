import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import type { FileRecord, Tag } from '../types'
import { normalizeTag } from '../utils/formatters'

interface DbNestedTag {
  tags: {
    name: string
  } | null
}

interface DbFileWithTags {
  id: string
  name: string
  storage_path: string
  public_url: string
  file_type: string
  file_size: number
  uploaded_by: string | null
  download_count: number | null
  created_at: string
  file_tags: DbNestedTag[] | null
}

interface DbTagLookup {
  id: string
  name: string
}

interface DbFileTagLookup {
  file_id: string
}

interface DbTrendingRow {
  tags: {
    id: string
    name: string
  } | null
  files: {
    created_at: string
  } | null
}

function mapFile(row: DbFileWithTags): FileRecord {
  return {
    id: row.id,
    name: row.name,
    storage_path: row.storage_path,
    public_url: row.public_url,
    file_type: row.file_type,
    file_size: row.file_size,
    uploaded_by: row.uploaded_by,
    download_count: row.download_count ?? 0,
    created_at: row.created_at,
    tags: row.file_tags?.map((item) => item.tags?.name).filter((name): name is string => Boolean(name)) ?? [],
  }
}

export function useFilesByTag(tagName: string | undefined) {
  const [files, setFiles] = useState<FileRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFiles = useCallback(async () => {
    const normalized = normalizeTag(tagName ?? '')

    if (!normalized) {
      setFiles([])
      setLoading(false)
      setError('Enter a hashtag to discover files.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data: tag, error: tagError } = await supabase
        .from('tags')
        .select('id,name')
        .eq('name', normalized)
        .maybeSingle<DbTagLookup>()

      if (tagError) throw tagError

      if (!tag) {
        setFiles([])
        return
      }

      const { data: fileTagRows, error: fileTagError } = await supabase
        .from('file_tags')
        .select('file_id')
        .eq('tag_id', tag.id)
        .returns<DbFileTagLookup[]>()

      if (fileTagError) throw fileTagError

      const fileIds = fileTagRows?.map((row) => row.file_id) ?? []

      if (fileIds.length === 0) {
        setFiles([])
        return
      }

      const { data, error: filesError } = await supabase
        .from('files')
        .select('id,name,storage_path,public_url,file_type,file_size,uploaded_by,download_count,created_at,file_tags(tags(name))')
        .in('id', fileIds)
        .order('created_at', { ascending: false })
        .returns<DbFileWithTags[]>()

      if (filesError) throw filesError

      setFiles((data ?? []).map(mapFile))
    } catch (caught) {
      setFiles([])
      setError(caught instanceof Error ? caught.message : 'Unable to load files for this hashtag.')
    } finally {
      setLoading(false)
    }
  }, [tagName])

  useEffect(() => {
    void fetchFiles()
  }, [fetchFiles])

  return { files, loading, error, refresh: fetchFiles }
}

export function useTrendingTags() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function fetchTrendingTags() {
      setLoading(true)
      setError(null)

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

      try {
        const { data, error: queryError } = await supabase
          .from('file_tags')
          .select('tags(id,name),files!inner(created_at)')
          .gte('files.created_at', sevenDaysAgo)
          .returns<DbTrendingRow[]>()

        if (queryError) throw queryError

        const counts = new Map<string, Tag>()

        for (const row of data ?? []) {
          if (!row.tags) continue

          const current = counts.get(row.tags.name)
          counts.set(row.tags.name, {
            id: row.tags.id,
            name: row.tags.name,
            count: (current?.count ?? 0) + 1,
          })
        }

        const nextTags = Array.from(counts.values())
          .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
          .slice(0, 8)

        if (active) setTags(nextTags)
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : 'Unable to load trending tags.')
      } finally {
        if (active) setLoading(false)
      }
    }

    void fetchTrendingTags()

    return () => {
      active = false
    }
  }, [])

  return { tags, loading, error }
}

export async function incrementDownloadCount(fileId: string): Promise<void> {
  const { error } = await supabase.rpc('increment_download_count', {
    file_id_input: fileId,
  })

  if (error) throw error
}
