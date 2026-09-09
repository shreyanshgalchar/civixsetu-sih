export function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} fill="none" aria-hidden>
      <defs>
        <linearGradient id="lgx" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22d3ee" />
          <stop offset="0.5" stopColor="#34d399" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill="#0a101f" stroke="url(#lgx)" strokeWidth="2" />
      <path d="M14 44 Q20 30 32 30 Q44 30 50 44" stroke="url(#lgx)" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M20 44 Q25 35 32 35 Q39 35 44 44" stroke="url(#lgx)" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
      <path d="M12 44 H52" stroke="#e6ebf7" strokeWidth="4" strokeLinecap="round" />
      <circle cx="32" cy="22" r="4" fill="#34d399" />
      <circle cx="32" cy="22" r="8" stroke="#34d399" strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
}
