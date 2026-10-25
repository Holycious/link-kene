export function PatternDivider() {
  return (
    <svg viewBox="0 0 260 22" className="stitch" aria-hidden="true">
      <path
        className="thread"
        d="M2 11 C 40 2, 70 20, 110 11 M150 11 C 190 2, 220 20, 258 11"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <rect
        className="needle"
        x="124"
        y="5"
        width="12"
        height="12"
        fill="none"
        stroke="var(--terracotta)"
        strokeWidth="1.2"
      />
    </svg>
  );
}
