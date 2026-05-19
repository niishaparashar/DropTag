import { FormEvent, useState } from 'react'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { normalizeTag } from '../utils/formatters'

interface SearchBarProps {
  autoFocus?: boolean
  compact?: boolean
}

export default function SearchBar({ autoFocus = false, compact = false }: SearchBarProps) {
  const navigate = useNavigate()
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const tag = normalizeTag(value)

    if (!tag) {
      setError('Enter a hashtag to search.')
      return
    }

    setError(null)
    navigate(`/tag/${tag}`)
  }

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div
        className={`flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-panel p-2 shadow-sm transition focus-within:border-emerald-400/60 ${
          compact ? 'max-w-lg' : 'mx-auto max-w-2xl'
        }`}
      >
        <Search aria-hidden className="ml-2 h-5 w-5 shrink-0 text-zinc-500" />
        <input
          autoFocus={autoFocus}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search #design, ui, launch..."
          className="min-h-11 flex-1 bg-transparent text-base text-white outline-none placeholder:text-zinc-500"
        />
        <button
          type="submit"
          className="min-h-11 rounded-xl bg-accent px-4 text-sm font-semibold text-black transition hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-panel"
        >
          Find
        </button>
      </div>
      {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}
    </form>
  )
}
