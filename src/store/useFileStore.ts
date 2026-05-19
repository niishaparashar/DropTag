import { create } from 'zustand'
import type { FileRecord, Tag } from '../types'

interface FileStore {
  files: FileRecord[]
  trendingTags: Tag[]
  lastUploadedFile: FileRecord | null
  setFiles: (files: FileRecord[]) => void
  setTrendingTags: (tags: Tag[]) => void
  setLastUploadedFile: (file: FileRecord | null) => void
  incrementLocalDownload: (fileId: string) => void
}

export const useFileStore = create<FileStore>((set) => ({
  files: [],
  trendingTags: [],
  lastUploadedFile: null,
  setFiles: (files) => set({ files }),
  setTrendingTags: (trendingTags) => set({ trendingTags }),
  setLastUploadedFile: (lastUploadedFile) => set({ lastUploadedFile }),
  incrementLocalDownload: (fileId) =>
    set((state) => ({
      files: state.files.map((file) =>
        file.id === fileId ? { ...file, download_count: file.download_count + 1 } : file,
      ),
    })),
}))
