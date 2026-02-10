export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" width={size} height={size}>
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4f46e5"/>
          <stop offset="100%" stopColor="#7c3aed"/>
        </linearGradient>
        <linearGradient id="glow" x1="20" y1="16" x2="44" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c4b5fd"/>
          <stop offset="100%" stopColor="#818cf8"/>
        </linearGradient>
        <linearGradient id="orb1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a78bfa"/>
          <stop offset="100%" stopColor="#6366f1"/>
        </linearGradient>
        <linearGradient id="orb2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c084fc"/>
          <stop offset="100%" stopColor="#8b5cf6"/>
        </linearGradient>
        <linearGradient id="orb3" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#67e8f9"/>
          <stop offset="100%" stopColor="#6366f1"/>
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#bg)"/>
      <ellipse cx="32" cy="32" rx="14" ry="14" fill="none" stroke="url(#glow)" strokeWidth="1.5" opacity="0.4"/>
      <ellipse cx="32" cy="32" rx="9" ry="9" fill="none" stroke="url(#glow)" strokeWidth="1" opacity="0.25"/>
      <circle cx="22" cy="22" r="5" fill="url(#orb1)" opacity="0.9"/>
      <circle cx="42" cy="20" r="4" fill="url(#orb2)" opacity="0.85"/>
      <circle cx="38" cy="42" r="5.5" fill="url(#orb3)" opacity="0.9"/>
      <circle cx="20" cy="40" r="3.5" fill="url(#orb1)" opacity="0.7"/>
      <circle cx="32" cy="30" r="3" fill="white" opacity="0.95"/>
      <line x1="22" y1="22" x2="32" y2="30" stroke="white" strokeWidth="0.8" opacity="0.3"/>
      <line x1="42" y1="20" x2="32" y2="30" stroke="white" strokeWidth="0.8" opacity="0.3"/>
      <line x1="38" y1="42" x2="32" y2="30" stroke="white" strokeWidth="0.8" opacity="0.3"/>
      <line x1="20" y1="40" x2="32" y2="30" stroke="white" strokeWidth="0.8" opacity="0.3"/>
      <line x1="22" y1="22" x2="42" y2="20" stroke="white" strokeWidth="0.5" opacity="0.15"/>
      <line x1="20" y1="40" x2="38" y2="42" stroke="white" strokeWidth="0.5" opacity="0.15"/>
      <line x1="22" y1="22" x2="20" y2="40" stroke="white" strokeWidth="0.5" opacity="0.15"/>
      <line x1="42" y1="20" x2="38" y2="42" stroke="white" strokeWidth="0.5" opacity="0.15"/>
      <circle cx="28" cy="18" r="1.2" fill="white" opacity="0.25"/>
      <circle cx="46" cy="32" r="1" fill="white" opacity="0.2"/>
      <circle cx="18" cy="32" r="1" fill="white" opacity="0.2"/>
      <circle cx="32" cy="46" r="1.2" fill="white" opacity="0.2"/>
    </svg>
  );
}
