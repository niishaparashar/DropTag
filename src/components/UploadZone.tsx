import { useEffect, useMemo, useState } from 'react'
import { FileArchive, FileUp, Image, X } from 'lucide-react'
import { FileRejection, useDropzone } from 'react-dropzone'
import { formatFileSize, getFileKind, getFileKindClass, getReadableFileKind } from '../utils/formatters'

interface UploadZoneProps {
  file: File | null
  onFileChange: (file: File | null) => void
  disabled?: boolean
}

export default function UploadZone({ file, onFileChange, disabled = false }: UploadZoneProps) {
  const [dropError, setDropError] = useState<string | null>(null)
  const previewUrl = useMemo(() => {
    if (!file || !file.type.startsWith('image/')) return null
    return URL.createObjectURL(file)
  }, [file])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    maxSize: 50 * 1024 * 1024,
    disabled,
    onDrop: (acceptedFiles) => {
      setDropError(null)
      onFileChange(acceptedFiles[0] ?? null)
    },
    onDropRejected: (fileRejections: FileRejection[]) => {
      const firstError = fileRejections[0]?.errors[0]
      setDropError(firstError?.code === 'file-too-large' ? 'Files must be 50MB or smaller.' : 'This file could not be added.')
    },
  })

  const kind = file ? getFileKind(file.type, file.name) : 'default'

  return (
    <section>
      <div
        {...getRootProps()}
        className={`flex min-h-[22rem] cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed p-6 text-center transition ${
          isDragActive
            ? 'border-emerald-300 bg-emerald-500/10'
            : 'border-white/15 bg-panel hover:border-emerald-300/50 hover:bg-zinc-900'
        } ${disabled ? 'cursor-not-allowed opacity-70' : ''}`}
      >
        <input {...getInputProps()} />
        {file ? (
          <div className="flex w-full max-w-md flex-col items-center">
            {previewUrl ? (
              <img src={previewUrl} alt={file.name} className="h-48 w-full rounded-md object-cover" />
            ) : (
              <div
                className={`flex h-40 w-full items-center justify-center rounded-2xl ring-1 ${getFileKindClass(kind)}`}
              >
                {kind === 'zip' ? (
                  <FileArchive aria-hidden className="h-12 w-12" />
                ) : kind === 'image' ? (
                  <Image aria-hidden className="h-12 w-12" />
                ) : (
                  <span className="text-xl font-bold">{getReadableFileKind(kind)}</span>
                )}
              </div>
            )}
            <div className="mt-4 w-full min-w-0">
              <p className="truncate text-base font-semibold text-white">{file.name}</p>
              <p className="mt-1 text-sm text-zinc-400">
                {formatFileSize(file.size)} / {file.type || 'application/octet-stream'}
              </p>
            </div>
            <button
              type="button"
              disabled={disabled}
              onClick={(event) => {
                event.stopPropagation()
                onFileChange(null)
              }}
              className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X aria-hidden className="h-4 w-4" />
              Remove
            </button>
          </div>
        ) : (
          <>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
              <FileUp aria-hidden className="h-8 w-8" />
            </div>
            <p className="mt-5 text-lg font-semibold text-white">
              {isDragActive ? 'Drop the file here' : 'Drag a file here or click to browse'}
            </p>
            <p className="mt-2 max-w-sm text-sm text-zinc-400">
              Upload one file up to 50MB. Images preview inline; other file types get a clear icon.
            </p>
          </>
        )}
      </div>
      {dropError ? (
        <p className="mt-3 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {dropError}
        </p>
      ) : null}
    </section>
  )
}
