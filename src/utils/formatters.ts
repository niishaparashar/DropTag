const fileTypeColors: Record<string, string> = {
  image: 'bg-sky-500/15 text-sky-300 ring-sky-500/30',
  pdf: 'bg-red-500/15 text-red-300 ring-red-500/30',
  zip: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  audio: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  video: 'bg-fuchsia-500/15 text-fuchsia-300 ring-fuchsia-500/30',
  code: 'bg-indigo-500/15 text-indigo-300 ring-indigo-500/30',
  document: 'bg-cyan-500/15 text-cyan-300 ring-cyan-500/30',
  default: 'bg-zinc-500/15 text-zinc-300 ring-zinc-500/30',
}

export function normalizeTag(value: string): string {
  return value
    .trim()
    .replace(/^#+/, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** index

  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export function getFileKind(mimeType: string, filename: string): string {
  const lowerName = filename.toLowerCase()

  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType === 'application/pdf' || lowerName.endsWith('.pdf')) return 'pdf'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType.startsWith('video/')) return 'video'
  if (/\.(zip|rar|7z|tar|gz)$/.test(lowerName)) return 'zip'
  if (/\.(ts|tsx|js|jsx|py|rb|go|rs|java|css|html|json|sql)$/.test(lowerName)) return 'code'
  if (/\.(doc|docx|txt|md|rtf|csv|xls|xlsx|ppt|pptx)$/.test(lowerName)) return 'document'

  return 'default'
}

export function getFileKindClass(kind: string): string {
  return fileTypeColors[kind] ?? fileTypeColors.default
}

export function getReadableFileKind(kind: string): string {
  const labels: Record<string, string> = {
    image: 'IMG',
    pdf: 'PDF',
    zip: 'ZIP',
    audio: 'AUD',
    video: 'VID',
    code: 'CODE',
    document: 'DOC',
    default: 'FILE',
  }

  return labels[kind] ?? labels.default
}
