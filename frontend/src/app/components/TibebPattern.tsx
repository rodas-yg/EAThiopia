export function TibebPattern({ className = "", variant = "default" }: { className?: string; variant?: "default" | "border" | "subtle" }) {
  if (variant === "border") {
    return (
      <svg
        className={className}
        viewBox="0 0 100 8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        {/* Tibeb border pattern */}
        <pattern id="tibeb-border" x="0" y="0" width="20" height="8" patternUnits="userSpaceOnUse">
          <path d="M0 4 L5 0 L10 4 L5 8 Z" fill="currentColor" opacity="0.3" />
          <path d="M10 4 L15 0 L20 4 L15 8 Z" fill="currentColor" opacity="0.2" />
          <line x1="5" y1="4" x2="15" y2="4" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
        </pattern>
        <rect width="100" height="8" fill="url(#tibeb-border)" />
      </svg>
    );
  }

  if (variant === "subtle") {
    return (
      <svg
        className={className}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <pattern id="tibeb-subtle" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
          {/* Subtle diagonal weave */}
          <path d="M0 25 L12.5 12.5 L25 25 L12.5 37.5 Z" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.05" />
          <path d="M25 25 L37.5 12.5 L50 25 L37.5 37.5 Z" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.05" />
          <circle cx="25" cy="25" r="2" fill="currentColor" opacity="0.08" />
        </pattern>
        <rect width="200" height="200" fill="url(#tibeb-subtle)" />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <pattern id="tibeb-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        {/* Traditional Tibeb woven pattern */}
        <path
          d="M20 0 L28 8 L20 16 L12 8 Z"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          opacity="0.12"
        />
        <path
          d="M0 20 L8 28 L0 36 L-8 28 Z"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          opacity="0.12"
        />
        <path
          d="M40 20 L48 28 L40 36 L32 28 Z"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          opacity="0.12"
        />
        <path
          d="M20 40 L28 48 L20 56 L12 48 Z"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          opacity="0.12"
        />
        {/* Cross weave detail */}
        <line x1="12" y1="8" x2="28" y2="8" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
        <line x1="20" y1="0" x2="20" y2="16" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
      </pattern>
      <rect width="200" height="200" fill="url(#tibeb-pattern)" />
    </svg>
  );
}
