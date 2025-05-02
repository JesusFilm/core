import { ReactElement } from 'react'

import Volume5 from '@core/shared/ui/icons/Volume5'
import VolumeOff from '@core/shared/ui/icons/VolumeOff'

interface ContentHeroMuteButtonProps {
  isMuted: boolean

  onClick: () => void
}

export function ContentHeroMuteButton({
  isMuted,
  onClick
}: ContentHeroMuteButtonProps): ReactElement {
  return (
    <button
      onClick={onClick}
      className="w-[56px] h-[56px] rounded-full bg-black/50 text-white ml-4 mr-1 transition-colors hover:bg-black/70"
      aria-label={isMuted ? 'muted' : 'unmuted'}
    >
      {isMuted ? (
        <VolumeOff sx={{ fontSize: '32px' }} />
      ) : (
        <Volume5 sx={{ fontSize: '32px' }} />
      )}
    </button>
  )
}
