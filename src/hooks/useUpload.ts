import { useCallback, useState } from 'react'
import { supabase } from '../supabaseClient'
import type { FileRecord, UploadResult, UploadStatus } from '../types'
import { normalizeTag } from '../utils/formatters'

const MAX_FILE_SIZE = 50 * 1024 * 1024
const BUCKET_NAME = 'droptag-files'

interface DbFileRow {
  id: string
  name: string
  storage_path: string
  public_url: string
  file_type: string
  file_size: number
  uploaded_by: string | null
  download_count: number | null
  created_at: string
}

interface DbTagRow {
  id: string
  name: string
}

interface UseUploadState {
  progress: number
  status: UploadStatus
  error: string | null
  result: UploadResult | null
  uploadFile: (file: File, tags: string[]) => Promise<UploadResult>
  reset: () => void
}

function toFileRecord(row: DbFileRow, tags: string[]): FileRecord {
  return {
    ...row,
    download_count: row.download_count ?? 0,
    tags,
  }
}

export function useUpload(): UseUploadState {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<UploadResult | null>(null)

  const reset = useCallback(() => {
    setProgress(0)
    setStatus('idle')
    setError(null)
    setResult(null)
  }, [])

  const uploadFile = useCallback(async (file: File, rawTags: string[]) => {
    const tags = Array.from(new Set(rawTags.map(normalizeTag).filter(Boolean)))

    if (file.size > MAX_FILE_SIZE) {
      setStatus('error')
      setError('Files must be 50MB or smaller.')
      throw new Error('Files must be 50MB or smaller.')
    }

    if (tags.length === 0) {
      setStatus('error')
      setError('Add at least one hashtag before uploading.')
      throw new Error('Add at least one hashtag before uploading.')
    }

    setStatus('uploading')
    setError(null)
    setProgress(8)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const extension = file.name.includes('.') ? file.name.split('.').pop() : 'bin'
      const storagePath = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`

      const { error: storageError } = await supabase.storage.from(BUCKET_NAME).upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

      if (storageError) throw storageError
      setProgress(45)

      const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath)

      const { data: fileData, error: fileError } = await supabase
        .from('files')
        .insert({
          name: file.name,
          storage_path: storagePath,
          public_url: publicUrlData.publicUrl,
          file_type: file.type || 'application/octet-stream',
          file_size: file.size,
          uploaded_by: user?.id ?? null,
        })
        .select('id,name,storage_path,public_url,file_type,file_size,uploaded_by,download_count,created_at')
        .single<DbFileRow>()

      if (fileError) throw fileError
      if (!fileData) throw new Error('The file upload finished, but the database row was not returned.')
      setProgress(65)

      const { error: tagInsertError } = await supabase
        .from('tags')
        .upsert(
          tags.map((name) => ({ name })),
          { onConflict: 'name', ignoreDuplicates: true },
        )

      if (tagInsertError) throw tagInsertError

      const { data: tagData, error: tagError } = await supabase
        .from('tags')
        .select('id,name')
        .in('name', tags)
        .returns<DbTagRow[]>()

      if (tagError) throw tagError
      if (!tagData || tagData.length !== tags.length) throw new Error('Tags could not be saved.')
      setProgress(82)

      const { error: junctionError } = await supabase.from('file_tags').insert(
        tagData.map((tag) => ({
          file_id: fileData.id,
          tag_id: tag.id,
        })),
      )

      if (junctionError) throw junctionError

      const uploadResult = {
        file: toFileRecord(fileData, tags),
        tags,
      }

      setProgress(100)
      setStatus('success')
      setResult(uploadResult)

      return uploadResult
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Upload failed. Please try again.'
      setStatus('error')
      setError(message)
      throw new Error(message)
    }
  }, [])

  return { progress, status, error, result, uploadFile, reset }
}
