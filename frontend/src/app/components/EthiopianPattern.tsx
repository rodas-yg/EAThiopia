export function EthiopianPattern({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <pattern id="ethiopian-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        {/* Traditional Ethiopian geometric pattern */}
        <path
          d="M20 0 L25 5 L20 10 L15 5 Z"
          fill="currentColor"
          opacity="0.08"
        />
        <path
          d="M0 20 L5 25 L0 30 L-5 25 Z"
          fill="currentColor"
          opacity="0.08"
        />
        <path
          d="M40 20 L45 25 L40 30 L35 25 Z"
          fill="currentColor"
          opacity="0.08"
        />
        <path
          d="M20 40 L25 45 L20 50 L15 45 Z"
          fill="currentColor"
          opacity="0.08"
        />
        <circle cx="20" cy="20" r="1.5" fill="currentColor" opacity="0.15" />
      </pattern>
      <rect width="200" height="200" fill="url(#ethiopian-pattern)" />
    </svg>
  );
}
