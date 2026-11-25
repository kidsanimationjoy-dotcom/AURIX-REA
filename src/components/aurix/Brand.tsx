export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 32 32" className="size-7 text-primary" aria-hidden>
        <path d="M16 2 29 9.5v13L16 30 3 22.5v-13Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M10 21 16 9l6 12M12.4 17h7.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <span className="font-display text-lg font-semibold tracking-tight">
        AURIX <span className="text-primary">REA</span>
      </span>
    </span>
  );
}
export const TAGLINE = "Understand. Reverse Engineer. Recreate.";