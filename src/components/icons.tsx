type IconProps = { className?: string };

export function Arrow({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M4 12h15M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.25" strokeLinecap="square" />
    </svg>
  );
}

export function ArrowLeft({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M20 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.25" strokeLinecap="square" />
    </svg>
  );
}

export function Plus({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="2.25" strokeLinecap="square" />
    </svg>
  );
}

export function Close({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2.25" strokeLinecap="square" />
    </svg>
  );
}

/** The poster asterisk ("*") used as a small typographic mark, never as a logo substitute. */
export function Asterisk({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="M10.4 2h3.2l-.5 7.3 6.6-3.2 1.6 2.8-6.1 4.1 6.1 4.1-1.6 2.8-6.6-3.2.5 7.3h-3.2l.5-7.3-6.6 3.2-1.6-2.8 6.1-4.1-6.1-4.1 1.6-2.8 6.6 3.2z"
        fill="currentColor"
      />
    </svg>
  );
}
