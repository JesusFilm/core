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
  const visible = !play || active || loading

  const show =
    (mute || volume === 0) && variant === 'unmute'
      ? true
      : variant === 'play'
        ? true
        : false

  return (
    <div
      className={`z-[2] flex w-full flex-col gap-4 pb-4 transition-opacity duration-[225ms] ${visible ? 'opacity-100' : 'opacity-0'} ${visible ? 'delay-0' : 'delay-[2000ms]'} `}
      style={{ transitionTimingFunction: 'ease-out' }}
    >
      <h2 className="mb-1 flex-grow font-sans text-3xl font-bold text-white opacity-90 mix-blend-screen md:text-4xl lg:text-5xl xl:text-6xl">
        {videoTitle}
      </h2>
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          show ? 'max-h-30' : 'max-h-0'
        }`}
      >
        <button
          id="play-button-lg"
          onClick={(e) => onClick?.(e)}
          className="z-2 flex min-w-[220px] cursor-pointer items-center justify-center gap-2 rounded-[8px] bg-[#CB333B] p-4 font-sans text-2xl leading-loose font-medium tracking-wide text-white shadow-md transition-colors hover:bg-[#A4343A]"
          style={{ display: showButton ? 'flex' : 'none' }}
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
