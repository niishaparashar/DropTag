import type { FileRecord } from '../types'
import FileCard from './FileCard'

interface FileGridProps {
  files: FileRecord[]
  loading?: boolean
}

function SkeletonCard() {
  return (
    <div className="min-h-[23rem] animate-pulse rounded-md border border-white/10 bg-panel">
      <div className="h-44 bg-zinc-800/80" />
      <div className="space-y-4 p-4">
        <div className="h-4 w-3/4 rounded bg-zinc-800" />
        <div className="h-3 w-1/2 rounded bg-zinc-800" />
        <div className="flex gap-2 pt-2">
          <div className="h-8 w-20 rounded bg-zinc-800" />
          <div className="h-8 w-16 rounded bg-zinc-800" />
        </div>
        <div className="h-10 w-full rounded bg-zinc-800" />
      </div>
    </div>
  )
}

export default function FileGrid({ files, loading = false }: FileGridProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {files.map((file) => (
        <FileCard key={file.id} file={file} />
      ))}
    </div>
  )
}
