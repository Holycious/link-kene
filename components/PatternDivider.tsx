export function PatternDivider() {
  return (
    <svg
      viewBox="0 0 300 20"
      className="mx-auto h-4 w-full max-w-[220px] text-[var(--color-wood)]"
      aria-hidden="true"
    >
      <line x1="0" y1="10" x2="118" y2="10" stroke="currentColor" strokeWidth="1" />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} transform={`translate(${135 + i * 8},10)`}>
          <rect
            x="-3"
            y="-3"
            width="6"
            height="6"
            transform="rotate(45)"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </g>
      ))}
      <line x1="182" y1="10" x2="300" y2="10" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
