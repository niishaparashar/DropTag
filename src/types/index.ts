export interface FileRecord {
  id: string
  name: string
  storage_path: string
  public_url: string
  file_type: string
  file_size: number
  uploaded_by: string | null
  download_count: number
  created_at: string
  tags: string[]
}

export interface Tag {
  id: string
  name: string
  count?: number
}

export interface UploadResult {
  file: FileRecord
  tags: string[]
}

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'
