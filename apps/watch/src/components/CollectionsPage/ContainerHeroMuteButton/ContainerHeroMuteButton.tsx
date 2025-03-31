import { ReactElement } from 'react'

interface ContainerHeroMuteButtonProps {
  isMuted: boolean
  onClick: () => void
}

export function ContainerHeroMuteButton({
  isMuted,
  onClick
}: ContainerHeroMuteButtonProps): ReactElement {
  return (
    <button
      onClick={onClick}
      className="p-3 rounded-full bg-black/50 text-white ml-4 -mb-3 mr-1 transition-colors hover:bg-black/70"
      aria-label={isMuted ? 'Включить звук' : 'Выключить звук'}
    >
      {isMuted ? (
        <svg
          data-testid="UnmuteIcon"
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 5L6 9H2v6h4l5 4zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
      ) : (
        <svg
          data-testid="MuteIcon"
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="1" y1="1" x2="23" y2="23"></line>
          <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
          <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
          <line x1="9" y1="9" x2="9" y2="9"></line>
        </svg>
      )}
    </button>
  )
}
