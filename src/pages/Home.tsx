import { useEffect, useState, FormEvent } from 'react'
import {
  ArrowRight,
  FolderKanban,
  Link2,
  LockKeyhole,
  Rocket,
  ShieldCheck,
  Sparkles,
  Upload,
  Users,
  Zap,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import BrandMark from '../components/BrandMark'
import TagBadge from '../components/TagBadge'
import { useTrendingTags } from '../hooks/useSearch'
import { useFileStore } from '../store/useFileStore'
import { normalizeTag } from '../utils/formatters'

const featureCards = [
  {
    icon: Zap,
    title: 'Instant uploads',
    description: 'Upload in a couple of clicks and share a single room link with everyone.',
  },
  {
    icon: Rocket,
    title: 'Temporary rooms',
    description: 'Rooms expire on a schedule so every shared space cleans itself up automatically.',
  },
  {
    icon: Users,
    title: 'No signups required',
    description: 'Jump straight in. No accounts, no emails, and no friction.',
  },
  {
    icon: LockKeyhole,
    title: 'PIN-protected access',
    description: 'Lock a room with a PIN so only invited people can view the files inside.',
  },
  {
    icon: ShieldCheck,
    title: 'Ephemeral by default',
    description: 'Rooms are built to disappear. Control how long they live and what stays visible.',
  },
  {
    icon: FolderKanban,
    title: 'Files and text, organized',
    description: 'Keep uploads and notes in one tidy room so the context never gets lost.',
  },
]

const steps = [
  {
    icon: Sparkles,
    title: 'Pick a hashtag',
    description: 'Choose any hashtag as your room name, just like a channel.',
  },
  {
    icon: Upload,
    title: 'Upload files or text',
    description: 'Drop files or paste text into the room in seconds.',
  },
  {
    icon: Link2,
    title: 'Share the room link',
    description: 'Send the URL to your team so they can view and download everything.',
  },
]

export default function Home() {
  const { tags, loading, error } = useTrendingTags()
  const setTrendingTags = useFileStore((state) => state.setTrendingTags)
  const navigate = useNavigate()
  const [roomValue, setRoomValue] = useState('')
  const [roomError, setRoomError] = useState<string | null>(null)

  useEffect(() => {
    setTrendingTags(tags)
  }, [setTrendingTags, tags])

  function onJoinRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const tag = normalizeTag(roomValue)

    if (!tag) {
      setRoomError('Enter a hashtag to open a room.')
      return
    }

    setRoomError(null)
    navigate(`/tag/${tag}`)
  }

  return (
    <div className="space-y-24 py-10 sm:py-14">
      <section id="top" className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
          <Sparkles aria-hidden className="h-3.5 w-3.5" />
          Now in public beta
        </span>
        <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
          Instant file sharing
          <span className="block text-emerald-400">with hashtag rooms</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
          Create or join a temporary cloud space and share files with anyone using a simple hashtag.
          Set a PIN, control room duration, and keep everything private.
        </p>

        <form onSubmit={onJoinRoom} className="mt-10 flex w-full max-w-3xl flex-col items-stretch gap-3 sm:flex-row">
          <div className="flex min-h-14 flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-panel px-4 shadow-lift transition focus-within:border-emerald-400/50">
            <span className="text-lg font-semibold text-zinc-500">#</span>
            <input
              autoFocus
              value={roomValue}
              onChange={(event) => setRoomValue(event.target.value)}
              placeholder="hackathon2026"
              className="min-h-12 flex-1 bg-transparent text-base text-white outline-none placeholder:text-zinc-500"
            />
          </div>
          <button
            type="submit"
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-6 text-sm font-semibold text-black transition hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-canvas"
          >
            Join Room
            <ArrowRight aria-hidden className="h-4 w-4" />
          </button>
          <Link
            to="/upload"
            className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Create Room
          </Link>
        </form>
        {roomError ? <p className="mt-3 text-sm text-red-300">{roomError}</p> : null}

        <p className="mt-5 text-sm text-zinc-500">No signups · PIN-protected rooms · Custom expiry · Files auto-delete</p>
      </section>

      <section id="features" style={{ scrollMarginTop: '5rem' }} className="mx-auto w-full max-w-6xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-400">Features</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Why teams choose droptag</h2>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-400">A fast, low-friction way to share files with a group.</p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featureCards.map((feature) => {
            const Icon = feature.icon

            return (
              <article key={feature.title} className="rounded-2xl border border-white/10 bg-panel p-6 shadow-sm transition hover:border-emerald-400/30 hover:bg-white/[0.035]">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400">
                  <Icon aria-hidden className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-7 text-zinc-400">{feature.description}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section id="how-it-works" style={{ scrollMarginTop: '5rem' }} className="mx-auto w-full max-w-6xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-400">How it works</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Three steps. That&apos;s it.</h2>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon

            return (
              <article key={step.title} className="relative rounded-2xl border border-white/10 bg-panel p-6 text-center">
                <div className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-canvas text-xs font-semibold text-zinc-200">
                  {index + 1}
                </div>
                <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-400">
                  <Icon aria-hidden className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-zinc-400">{step.description}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section id="rooms" style={{ scrollMarginTop: '5rem' }} className="mx-auto w-full max-w-6xl rounded-3xl border border-white/10 bg-panel/60 p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-400">Recent rooms</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Jump back into active hashtag rooms</h2>
          </div>
          <p className="text-sm text-zinc-500">Browse the latest public rooms or search for one you already know.</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {loading ? (
            Array.from({ length: 8 }, (_, index) => (
              <span key={index} className="h-9 w-28 animate-pulse rounded-full bg-zinc-800" />
            ))
          ) : error ? (
            <p className="text-sm text-red-300">{error}</p>
          ) : tags.length > 0 ? (
            tags.map((tag) => <TagBadge key={tag.id} name={tag.name} count={tag.count} />)
          ) : (
            <>
              <TagBadge name="demo" />
              <TagBadge name="launch" />
              <TagBadge name="design" />
            </>
          )}
        </div>
      </section>

      <footer className="mx-auto flex w-full max-w-6xl flex-col gap-4 border-t border-white/10 pt-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-zinc-300">
          <BrandMark className="h-8 w-8" />
          droptag.cloud
        </div>
        <div className="flex flex-wrap gap-5">
          <Link to="/upload" className="transition hover:text-white">
            Create room
          </Link>
          <a href="#features" className="transition hover:text-white">
            Features
          </a>
          <a href="#how-it-works" className="transition hover:text-white">
            How it works
          </a>
          <a href="#rooms" className="transition hover:text-white">
            Rooms
          </a>
        </div>
      </footer>
    </div>
  )
}
