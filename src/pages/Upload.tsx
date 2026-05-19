import { FormEvent, useState } from 'react'
import { CheckCircle2, Loader2, UploadCloud } from 'lucide-react'
import { Link } from 'react-router-dom'
import BackButton from '../components/BackButton'
import TagInput from '../components/TagInput'
import UploadZone from '../components/UploadZone'
import { useUpload } from '../hooks/useUpload'
import { useFileStore } from '../store/useFileStore'

export default function Upload() {
  const [file, setFile] = useState<File | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [formError, setFormError] = useState<string | null>(null)
  const { uploadFile, progress, status, error, result, reset } = useUpload()
  const setLastUploadedFile = useFileStore((state) => state.setLastUploadedFile)
  const isUploading = status === 'uploading'
  const isComplete = status === 'success'

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isComplete) return

    if (!file) {
      setFormError('Choose a file before uploading.')
      return
    }

    if (tags.length === 0) {
      setFormError('Add at least one hashtag before uploading.')
      return
    }

    setFormError(null)

    try {
      const uploadResult = await uploadFile(file, tags)
      setLastUploadedFile(uploadResult.file)
    } catch {
      setLastUploadedFile(null)
    }
  }

  function startOver() {
    setFile(null)
    setTags([])
    setFormError(null)
    setLastUploadedFile(null)
    reset()
  }

  return (
    <div className="space-y-8 py-6">
      <section className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-panel/70 p-6 sm:flex-row sm:items-end sm:justify-between lg:p-8">
        <div>
          <div className="mb-5">
            <BackButton />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-400">Upload</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Upload a file</h1>
          <p className="mt-2 max-w-2xl text-zinc-400">Drop one file, add hashtags, and publish it to shared boards.</p>
        </div>
      </section>

      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(22rem,0.75fr)]">
        <UploadZone file={file} onFileChange={setFile} disabled={isUploading || isComplete} />

        <aside className="rounded-3xl border border-white/10 bg-panel p-5 lg:p-6">
          <div className="space-y-6">
            <TagInput tags={tags} onChange={setTags} disabled={isUploading || isComplete} />

            {isUploading || status === 'success' ? (
              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-zinc-300">
                  <span>{status === 'success' ? 'Upload complete' : 'Uploading'}</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                  <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            ) : null}

            {formError || error ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
                {formError ?? error}
              </div>
            ) : null}

            {result ? (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 aria-hidden className="h-5 w-5" />
                  Ready to share
                </div>
                <p className="mt-2 text-emerald-100/85">
                  Share with {result.tags.map((tag) => `#${tag}`).join(' ')}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {result.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/tag/${tag}`}
                      className="rounded-md bg-emerald-400/15 px-3 py-1.5 font-medium text-emerald-50 transition hover:bg-emerald-400/25"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              {isComplete && result ? (
                <Link
                  to={`/tag/${result.tags[0]}`}
                  className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-panel"
                >
                  View uploaded file
                </Link>
              ) : (
                <button
                  type="submit"
                  disabled={isUploading || !file}
                  className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-panel disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUploading ? <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> : <UploadCloud aria-hidden className="h-4 w-4" />}
                  Publish file
                </button>
              )}
              {isComplete ? (
                <button
                  type="button"
                  onClick={startOver}
                  className="min-h-11 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-white/10"
                >
                  New upload
                </button>
              ) : null}
            </div>
          </div>
        </aside>
      </form>
    </div>
  )
}
