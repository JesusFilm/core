'use client'

export const AnimatedLoadingText = () => (
  <span className="inline-flex items-center">
    {Array.from('Running...').map((char, index) => (
      <span
        key={`${char}-${index}`}
        className="animate-pulse"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        {char}
      </span>
    ))}
  </span>
)
