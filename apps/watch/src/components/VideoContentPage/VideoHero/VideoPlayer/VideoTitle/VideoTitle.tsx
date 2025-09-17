import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded'
import VolumeOff from '@mui/icons-material/VolumeOff'
import VolumeUpOutlined from '@mui/icons-material/VolumeUpOutlined'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { usePlayer } from '../../../../../libs/playerContext'
import { getWatchUrl } from '../../../../../libs/utils/getWatchUrl'
import { useVideo } from '../../../../../libs/videoContext'

interface VideoTitleProps {
  videoTitle: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  variant?: 'play' | 'unmute'
  style?: React.CSSProperties
  showButton: boolean
  isPreview?: boolean
  videoLabel?: string
  videoDescription?: string
  containerSlug?: string
  onMuteToggle?: () => void
  collectionTitle?: string
}

export function VideoTitle({
  videoTitle,
  onClick,
  variant = 'play',
  showButton,
  isPreview = false,
  videoLabel,
  videoDescription,
  containerSlug,
  onMuteToggle,
  collectionTitle
}: VideoTitleProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const { label, variant: videoVariant } = useVideo()
  const {
    state: { play, active, loading, mute, volume }
  } = usePlayer()
  const visible = isPreview || !play || active || loading

  const show =
    (mute || volume === 0) && variant === 'unmute'
      ? true
      : variant === 'play'
        ? true
        : false

  const watchNowHref = getWatchUrl(containerSlug, label, videoVariant?.slug)

  return (
    <div
      className={`
        pb-8
        gap-1
        w-full flex flex-col relative
        transition-opacity duration-[225ms]
        ${visible ? 'opacity-100' : 'opacity-0'}
        ${visible ? 'delay-0' : 'delay-[2000ms]'}
      `}
      style={{ transitionTimingFunction: 'ease-out' }}
    >
      {videoLabel && (
        <div className="text-sm uppercase tracking-widest text-[#CB333B] font-sans font-bold mb-0 animate-fade-in-up animation-delay-100">
          {videoLabel}
        </div>
      )}
      <h2
        className="
          font-bold text-stone-50 text-shadow-xs
          flex-grow mb-0 text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-sans
          animate-fade-in-up animation-delay-200
         "
      >
        {videoTitle.replace(/^\d+\.\s*/, '')}
      </h2>
      {collectionTitle && isPreview && (
        <div className="inverted-effect text-black text-xl md:text-2xl font-sans font-medium opacity-80 mt-2 animate-fade-in-up animation-delay-300 text-shadow-xs">
          {collectionTitle}
        </div>
      )}
      {videoDescription && isPreview && (
        <p className=" text-stone-300 text-md leading-relaxed font-sans max-w-3xl mb-2 animate-fade-in-up animation-delay-400 line-clamp-3 text-shadow-xs">
          {videoDescription}
        </p>
      )}
      {showButton && show && !isPreview && (
        <button
          id="play-button-lg"
          onClick={(e) => onClick?.(e)}
          className="inline-flex items-center justify-center gap-2 px-6 py-3
            bg-[#CB333B] text-lg font-medium text-stone-100
            rounded-full shadow-md transition-colors duration-200
            hover:bg-[#A4343A] font-sans cursor-pointer self-start
            animate-fade-in-up animation-delay-500"
        >
          {variant === 'play' && <PlayArrowRounded fontSize="medium" />}
          {variant === 'unmute' && <VolumeOff fontSize="medium" />}
          {variant === 'play' && t('Play')}
          {variant === 'unmute' && t('Play with sound')}
        </button>
      )}
      {isPreview && (
        <NextLink
          href={watchNowHref}
          scroll={false}
          locale={false}
          id="watch-now-button"
          className="inline-flex z-1 items-center justify-center gap-2 px-6 py-3
            bg-[#CB333B] text-lg font-medium text-stone-100
            rounded-full shadow-md transition-colors duration-200
            hover:bg-[#A4343A] font-sans cursor-pointer self-start no-underline
            animate-fade-in-up animation-delay-500"
        >
          <PlayArrowRounded fontSize="medium" />
          Watch Now
        </NextLink>
      )}
      {isPreview && onMuteToggle && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onMuteToggle()
          }}
          className="absolute z-0 cursor-pointer bottom-7 right-0 scale-125 text-stone-50 p-2 rounded-full hover:bg-white/20 transition-colors duration-200 mute-preview-toggle"
          aria-label={mute || volume === 0 ? t('Unmute') : t('Mute')}
        >
          {mute || volume === 0 ? <VolumeOff /> : <VolumeUpOutlined />}
        </button>
      )}
    </div>
  )
}
