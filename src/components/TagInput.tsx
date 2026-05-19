import { KeyboardEvent, useState } from 'react'
import { X } from 'lucide-react'
import { normalizeTag } from '../utils/formatters'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  disabled?: boolean
}

export default function TagInput({ tags, onChange, disabled = false }: TagInputProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  function addTag(rawValue: string) {
    const normalized = normalizeTag(rawValue)

    if (!normalized) {
      setValue('')
      return
    }

    if (tags.includes(normalized)) {
      setError(`#${normalized} is already added.`)
      setValue('')
      return
    }

    onChange([...tags, normalized])
    setValue('')
    setError(null)
  }

  function removeTag(tag: string) {
    onChange(tags.filter((item) => item !== tag))
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addTag(value)
    }

    if (event.key === 'Backspace' && value.length === 0 && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  return (
    <div>
      <label htmlFor="hashtags" className="text-sm font-medium text-zinc-200">
        Hashtags
      </label>
      <div className="mt-2 flex min-h-14 flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-zinc-950/45 px-3 py-2 focus-within:border-emerald-400/60">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex min-h-8 items-center gap-1 rounded-full bg-emerald-400/15 px-2.5 py-1 text-sm font-medium text-emerald-100"
          >
            #{tag}
            <button
              type="button"
              disabled={disabled}
              onClick={() => removeTag(tag)}
              className="rounded p-0.5 text-emerald-100/70 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={`Remove #${tag}`}
            >
              <X aria-hidden className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        <input
          id="hashtags"
          value={value}
          disabled={disabled}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => addTag(value)}
          placeholder={tags.length === 0 ? '#design, #ui, #brief' : 'Add tag'}
          className="min-h-9 min-w-36 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500 disabled:cursor-not-allowed"
        />
      </div>
      <p className="mt-2 text-sm text-zinc-500">Press Enter or comma to add each hashtag.</p>
      {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}
    </div>
  )
}
