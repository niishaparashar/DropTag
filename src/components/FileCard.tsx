import { Download, ExternalLink, FileArchive, FileText, Image, Music, Video } from 'lucide-react'
import type { FileRecord } from '../types'
import { formatDate, formatFileSize, getFileKind, getFileKindClass, getReadableFileKind } from '../utils/formatters'
import TagBadge from './TagBadge'
import { incrementDownloadCount } from '../hooks/useSearch'
import { useFileStore } from '../store/useFileStore'

interface FileCardProps {
  file: FileRecord
}

function FileIcon({ kind }: { kind: string }) {
  const className = 'h-8 w-8'

  if (kind === 'image') return <Image aria-hidden className={className} />
  if (kind === 'zip') return <FileArchive aria-hidden className={className} />
  if (kind === 'audio') return <Music aria-hidden className={className} />
  if (kind === 'video') return <Video aria-hidden className={className} />
  if (kind === 'document' || kind === 'pdf' || kind === 'code') return <FileText aria-hidden className={className} />

  return <span className="text-sm font-bold">{getReadableFileKind(kind)}</span>
}

export default function FileCard({ file }: FileCardProps) {
  const incrementLocalDownload = useFileStore((state) => state.incrementLocalDownload)
  const kind = getFileKind(file.file_type, file.name)
  const isImage = file.file_type.startsWith('image/')

  async function onDownload() {
    window.open(file.public_url, '_blank', 'noopener,noreferrer')
    incrementLocalDownload(file.id)

    try {
      await incrementDownloadCount(file.id)
    } catch (error) {
      console.error('Failed to increment download count', error)
    }
  }

  return (
    <article className="flex min-h-[23rem] flex-col overflow-hidden rounded-2xl border border-white/10 bg-panel transition duration-200 hover:-translate-y-1 hover:border-emerald-400/30 hover:shadow-lift">
      <div className="relative flex h-44 items-center justify-center bg-zinc-950/55">
        {isImage ? (
          <img src={file.public_url} alt={file.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className={`flex h-20 w-20 items-center justify-center rounded-md ring-1 ${getFileKindClass(kind)}`}>
            <FileIcon kind={kind} />
          </div>
        )}
        <span className={`absolute right-3 top-3 rounded-full px-2 py-1 text-xs font-bold ring-1 ${getFileKindClass(kind)}`}>
          {getReadableFileKind(kind)}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-white" title={file.name}>
            {file.name}
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            {formatFileSize(file.file_size)} / {formatDate(file.created_at)}
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {file.tags.map((tag) => (
            <TagBadge key={tag} name={tag} />
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <span className="text-sm text-zinc-500">{file.download_count} downloads</span>
          <button
            type="button"
            onClick={() => {
              void onDownload()
            }}
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-accent px-3 py-2 text-sm font-semibold text-black transition hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-panel"
          >
            <Download aria-hidden className="h-4 w-4" />
            <span>Download</span>
            <ExternalLink aria-hidden className="h-3.5 w-3.5 opacity-70" />
          </button>
        </div>
      </div>
    </article>
  )
}
