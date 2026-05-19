import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function BackButton() {
  const navigate = useNavigate()

  function goBack() {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/')
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-sm font-semibold text-zinc-200 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-canvas"
    >
      <ArrowLeft aria-hidden className="h-4 w-4" />
      Back
    </button>
  )
}
