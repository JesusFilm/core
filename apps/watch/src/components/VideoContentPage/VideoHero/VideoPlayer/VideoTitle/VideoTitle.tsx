import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded'
import SkipNextRounded from '@mui/icons-material/SkipNextRounded'
import VolumeOff from '@mui/icons-material/VolumeOff'
import VolumeUpOutlined from '@mui/icons-material/VolumeUpOutlined'
import clsx from 'clsx'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { usePlayer } from '../../../../../libs/playerContext'
import { getWatchUrl } from '../../../../../libs/utils/getWatchUrl'
import { useVideo } from '../../../../../libs/videoContext'
import type { InsertAction } from '../../../../../types/inserts'

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
  action?: InsertAction
  isMuxInsert?: boolean
  onSkip?: () => void
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
  collectionTitle,
  action,
  isMuxInsert = false,
  onSkip
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

        // console.log('mute', mute)
        // console.log('volume', volume)

  const watchNowHref = getWatchUrl(containerSlug, label, videoVariant?.slug)

  return (
    <div
      className={`
        pb-8
        gap-4
        w-full flex relative
        transition-opacity duration-[225ms]
        ${visible ? 'opacity-100' : 'opacity-0'}
        ${visible ? 'delay-0' : 'delay-[2000ms]'}
        ${mute || volume === 0 ? 'flex-col' : 'flex-row items-center'}
      `}
      style={{ transitionTimingFunction: 'ease-out' }}
    >

      {isPreview && !isMuxInsert && !(mute || volume === 0) && (
        <NextLink
          href={action?.url || watchNowHref}
          scroll={false}
          locale={false}
          id={action ? "mux-action-button" : "watch-now-button"}
          className={clsx(
            "inline-flex z-1 items-center justify-center gap-2 px-5 py-3 flex-shrink-0",
            "bg-[#CB333B] text-lg font-medium text-stone-100",
            "rounded-full shadow-md transition-colors duration-200",
            "hover:bg-[#A4343A] font-sans cursor-pointer no-underline",
            "animate-fade-in-up animation-delay-500",

          )}
        >
          <PlayArrowRounded fontSize="medium" className="-ml-1" />
          {action?.label || t('Watch')}
        </NextLink>
      )}

      {/* Unmuted version */}
      {!(mute || volume === 0) && (
        <div className="flex flex-col flex-1">
          {videoLabel && (
            <div
              className={`
                uppercase tracking-widest text-[#FF9E00] font-sans font-bold animate-fade-in-up animation-delay-100
                ${isMuxInsert ? 'text-lg' : 'text-sm'}
              `}
            >
              {videoLabel}
            </div>
          )}
          <h2
            className="font-bold text-stone-50 text-shadow-xs mb-0 font-sans animate-fade-in-up animation-delay-200 text-xl md:text-xl lg:text-2xl xl:text-2xl"
          >
            {videoTitle.replace(/^\d+\.\s*/, '')}
          </h2>
          {collectionTitle && isPreview && (
            <div className="inverted-effect text-black font-sans font-medium opacity-80 mt-2 animate-fade-in-up animation-delay-300 text-shadow-xs text-sm">
              {collectionTitle}
            </div>
          )}
        </div>
      )}

      {/* Muted version */}
      {(mute || volume === 0) && (
        <div className="flex flex-col gap-1">
          {videoLabel && (
            <div
              className={`
                uppercase tracking-widest text-[#FF9E00] font-sans font-bold mb-0 animate-fade-in-up animation-delay-100
                ${isMuxInsert ? 'text-lg' : 'text-md'}
              `}
            >
              {videoLabel}
            </div>
          )}
          <h2 className="font-bold text-stone-50 text-shadow-xs mb-0 font-sans animate-fade-in-up animation-delay-200 text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
            {videoTitle.replace(/^\d+\.\s*/, '')}
          </h2>
          {collectionTitle && isPreview && (
            <div className="inverted-effect text-black font-sans font-medium opacity-80 mt-2 animate-fade-in-up animation-delay-300 text-shadow-xs text-xl md:text-2xl">
              {collectionTitle}
            </div>
          )}
          {videoDescription && isPreview && (
            <p
              className={`
                text-stone-300
                ${isMuxInsert ? 'text-3xl leading-snug' : 'text-md leading-relaxed'}
                font-sans max-w-3xl mb-2 animate-fade-in-up animation-delay-400 line-clamp-3 text-shadow-xs
              `}
            >
              {videoDescription}
            </p>
          )}
        </div>
      )}

      {showButton && show && !isPreview && (
        <button
          id="play-button-lg"
          onClick={(e) => onClick?.(e)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3
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
      {isPreview && !isMuxInsert && (mute || volume === 0) && (
        <NextLink
          href={action?.url || watchNowHref}
          scroll={false}
          locale={false}
          id={action ? "mux-action-button" : "watch-now-button"}
          className={clsx(
            "inline-flex z-1 items-center justify-center gap-2 px-5 py-3",
            "bg-[#CB333B] text-lg font-medium text-stone-100",
            "rounded-full shadow-md transition-colors duration-200",
            "hover:bg-[#A4343A] font-sans cursor-pointer self-start no-underline",
            "animate-fade-in-up animation-delay-500",

          )}
        >
          <PlayArrowRounded fontSize="medium" className="-ml-1" />
          {action?.label || t('Watch Now')}
        </NextLink>
      )}
      
      {isPreview && (onMuteToggle != null || onSkip != null) && (
        <div className="absolute z-0 bottom-7 right-0 flex items-center gap-2 scale-150">
          {onSkip != null && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onSkip()
              }}
              className="z-50 cursor-pointer text-stone-50/50 p-2 rounded-full hover:text-stone-50 transition-colors duration-200"
              aria-label={t('Skip video')}
            >
              <SkipNextRounded fontSize="medium" />
            </button>
          )}
          {onMuteToggle != null && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onMuteToggle()
              }}
              className="cursor-pointer text-stone-50/50 p-2 rounded-full hover:text-stone-50 transition-colors duration-200 mute-preview-toggle"
              aria-label={mute || volume === 0 ? t('Unmute') : t('Mute')}
            >
              {mute || volume === 0 ? <VolumeOff /> : <VolumeUpOutlined />}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
