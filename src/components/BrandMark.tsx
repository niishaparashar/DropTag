interface BrandMarkProps {
  className?: string
}

export default function BrandMark({ className = '' }: BrandMarkProps) {
  return (
    <span
      aria-hidden
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-400 text-black shadow-[0_0_0_1px_rgba(16,185,129,0.28),0_18px_30px_-18px_rgba(16,185,129,0.85)] ${className}`}
    >
      <span className="absolute inset-[6px] rounded-[10px] border border-black/20" />
      <span className="absolute left-[8px] top-[11px] h-[2px] w-[15px] rounded-full bg-black" />
      <span className="absolute left-[8px] bottom-[11px] h-[2px] w-[15px] rounded-full bg-black" />
      <span className="absolute left-[11px] top-[8px] h-[15px] w-[2px] rounded-full bg-black" />
      <span className="absolute right-[11px] top-[8px] h-[15px] w-[2px] rounded-full bg-black" />
      <span className="absolute right-[6px] top-[6px] h-2 w-2 rounded-full bg-white/90" />
    </span>
  )
}