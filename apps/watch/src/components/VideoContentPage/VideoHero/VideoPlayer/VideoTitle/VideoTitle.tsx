import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded'
import VolumeOff from '@mui/icons-material/VolumeOff'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useWatch } from '../../../../../libs/watchContext'

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
    state: {
      player: { play, active, loading, mute, volume }
    }
  } = useWatch()
  const visible = !play || active || loading

  const show =
    (mute || volume === 0) && variant === 'unmute'
      ? true
      : variant === 'play'
        ? true
        : false

  return (
    <div
      className={`
        pb-4 
        gap-4 
        w-full z-[2] flex flex-col 
        transition-opacity duration-[225ms]
        ${visible ? 'opacity-100' : 'opacity-0'}
        ${visible ? 'delay-0' : 'delay-[2000ms]'}
      `}
      style={{
        transitionTimingFunction: 'ease-out'
      }}
    >
      <h1
        className="
          font-bold text-white opacity-90 mix-blend-screen 
          flex-grow mb-1 text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-sans
        "
      >
        {videoTitle}
      </h1>
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          show ? 'max-h-14' : 'max-h-0'
        }`}
      >
        <button
          id="play-button-lg"
          onClick={(e) => onClick?.(e)}
          className="z-2 flex w-[220px] items-center justify-center gap-2 rounded 
        bg-[#CB333B] py-2 text-[15px] font-medium leading-loose 
        tracking-wide text-white shadow-md transition-colors
        hover:bg-[#A4343A] font-sans
        "
          style={{
            display: showButton ? 'flex' : 'none'
          }}
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
