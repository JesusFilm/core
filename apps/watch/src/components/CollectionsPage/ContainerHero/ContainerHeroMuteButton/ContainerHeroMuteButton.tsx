import VolumeOffOutlined from '@mui/icons-material/VolumeOffOutlined'
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
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M16.883 8.5V4l-4.651 4.651H5.5v6.697h4.046M16.883 13v7L13 16.117M6 18.5l3.546-3.152M19.5 6.5l-9.954 8.848"
          />
        </svg>
      ) : (
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
      )}
    </button>
  )
}
