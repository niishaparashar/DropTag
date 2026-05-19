import { Sparkles } from 'lucide-react'
import { NavLink, Link } from 'react-router-dom'
import BrandMark from './BrandMark'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-canvas/80 backdrop-blur">
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex items-center gap-2 text-lg font-semibold tracking-normal text-white">
          <BrandMark />
          <span className="hidden sm:inline">DropTag</span>
        </NavLink>
        <div className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
          <a href="/#features" className="transition hover:text-white">
            Features
          </a>
          <a href="/#how-it-works" className="transition hover:text-white">
            How it works
          </a>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/upload"
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-canvas"
          >
            <Sparkles aria-hidden className="h-4 w-4" />
            <span className="hidden sm:inline">Create Room</span>
            <span className="sm:hidden">Create</span>
          </Link>
        </div>
      </nav>
    </header>
  )
}
