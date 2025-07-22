import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded'
import VolumeOff from '@mui/icons-material/VolumeOff'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { usePlayer } from '../../../../../libs/playerContext'

interface VideoTitleProps {
  videoTitle: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  variant?: 'play' | 'unmute'
  style?: React.CSSProperties
  showButton: boolean
}

export function VideoTitle({
  videoTitle,
  onClick,
  variant = 'play',
  showButton
}: VideoTitleProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const {
    state: { play, active, loading, mute, volume }
  } = usePlayer()

  const show =
    (mute || volume === 0) && variant === 'unmute'
      ? true
      : variant === 'play'
        ? true
        : false

  return (
    <div
      data-testid="video-title"
      className={`
        absolute
        bottom-30
        gap-4 
        w-full z-[2] flex flex-col 
        transition-opacity duration-[200ms] 
        ${show ? 'opacity-100' : 'opacity-0'}
      `}
      style={{ transitionTimingFunction: 'ease-out' }}
    >
      <h2
        className={`
          font-bold text-white opacity-90 mix-blend-screen 
          flex-grow mb-1 text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-sans
        `}
      >
        {videoTitle}
      </h2>
      <div className={`overflow-hidden `}>
        <button
          id="play-button-lg"
          onClick={(e) => onClick?.(e)}
          className={`
            z-2 min-w-[220px] items-center justify-center gap-2  
            bg-[#CB333B] p-4 text-2xl font-medium leading-loose 
            tracking-wide text-white shadow-md transition-colors
            hover:bg-[#A4343A] font-sans rounded-[8px] cursor-pointer
            ${showButton ? 'opacity-100' : 'opacity-0'}
          `}
        >
          {variant === 'play' && <PlayArrowRounded fontSize="large" />}
          {variant === 'unmute' && <VolumeOff fontSize="large" />}
          {variant === 'play' && t('Play')}
          {variant === 'unmute' && t('Play with sound')}
        </button>
      </div>
    </div>
  )
}
