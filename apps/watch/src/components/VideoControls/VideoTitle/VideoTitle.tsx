import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded'
import SkipNextRounded from '@mui/icons-material/SkipNextRounded'
import VolumeOff from '@mui/icons-material/VolumeOff'
import VolumeUpOutlined from '@mui/icons-material/VolumeUpOutlined'
import clsx from 'clsx'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { usePlayer } from '../../../libs/playerContext'
import { getWatchUrl } from '../../../libs/utils/getWatchUrl'
import { useVideo } from '../../../libs/videoContext'
import type { InsertAction } from '../../../types/inserts'

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
  const { label, variant: videoVariant, slug } = useVideo()
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

  // For carousel preview, use undefined containerSlug if it's the default 'watch' value
  // This ensures getWatchUrl uses the variant slug format instead
  const effectiveContainerSlug =
    isPreview && containerSlug === 'watch' ? undefined : containerSlug

  const watchNowHref = getWatchUrl(
    effectiveContainerSlug,
    label,
    videoVariant?.slug
  )

  return (
    <div
      className={`relative flex w-full gap-4 pb-8 transition-opacity duration-[225ms] ${visible ? 'opacity-100' : 'opacity-0'} ${visible ? 'delay-0' : 'delay-[2000ms]'} ${mute || volume === 0 ? 'flex-col' : 'flex-row items-center'} `}
      style={{ transitionTimingFunction: 'ease-out' }}
    >
      {isPreview && !isMuxInsert && !(mute || volume === 0) && (
        <NextLink
          href={action?.url || watchNowHref}
          scroll={false}
          locale={false}
          id={action ? 'mux-action-button' : 'watch-now-button'}
          className={clsx(
            'z-1 inline-flex flex-shrink-0 items-center justify-center gap-2 px-5 py-3',
            'bg-[#CB333B] text-lg font-medium text-stone-100',
            'rounded-full shadow-md transition-colors duration-200',
            'cursor-pointer font-sans no-underline hover:bg-[#A4343A]',
            'animate-fade-in-up animation-delay-500 z-100'
          )}
        >
          <PlayArrowRounded fontSize="medium" className="-ml-1" />
          {action?.label || t('Watch')}
        </NextLink>
      )}

      {/* Unmuted version */}
      {!(mute || volume === 0) && (
        <div className="flex flex-1 flex-col">
          {videoLabel && (
            <div
              className={`animate-fade-in-up animation-delay-100 font-sans font-bold tracking-widest text-[#FF9E00] uppercase ${isMuxInsert ? 'text-lg' : 'text-sm'} `}
            >
              {videoLabel}
            </div>
          )}
          <h2 className="animate-fade-in-up animation-delay-200 mb-0 font-sans text-xl font-bold text-stone-50 text-shadow-xs md:text-xl lg:text-2xl xl:text-2xl">
            {videoTitle.replace(/^\d+\.\s*/, '')}
          </h2>
          {collectionTitle && isPreview && (
            <div className="inverted-effect animate-fade-in-up animation-delay-300 mt-2 font-sans text-sm font-medium text-black opacity-80 text-shadow-xs">
              {collectionTitle}
            </div>
          )}
        </div>
      )}

      {/* Muted version */}
      {(mute || volume === 0) && (
        <div className="flex flex-col gap-1 pr-30 md:pr-0">
          {videoLabel && (
            <div
              className={`animate-fade-in-up animation-delay-100 mb-0 font-sans font-bold tracking-widest text-[#FF9E00] uppercase ${isMuxInsert ? 'text-lg' : 'text-md'} `}
            >
              {videoLabel}
            </div>
          )}
          <h2 className="animate-fade-in-up animation-delay-200 mb-0 font-sans text-3xl font-bold text-stone-50 text-shadow-xs md:text-4xl lg:text-5xl xl:text-6xl">
            {videoTitle.replace(/^\d+\.\s*/, '')}
          </h2>
          {collectionTitle && isPreview && (
            <div className="inverted-effect animate-fade-in-up animation-delay-300 mt-2 font-sans text-xl font-medium text-black opacity-80 text-shadow-xs md:text-2xl">
              {collectionTitle}
            </div>
          )}
          {videoDescription && isPreview && (
            <p
              className={`hidden text-stone-300/70 lg:line-clamp-2 xl:lg:line-clamp-3 ${isMuxInsert ? 'text-xl leading-snug md:text-3xl' : 'text-md leading-relaxed'} animate-fade-in-up animation-delay-400 mb-2 max-w-3xl font-sans text-shadow-xs`}
            >
              {videoDescription.replace(/\n/g, '')}
            </p>
          )}
        </div>
      )}

      {showButton && show && !isPreview && (
        <button
          id="play-button-lg"
          onClick={(e) => onClick?.(e)}
          className="animate-fade-in-up animation-delay-500 inline-flex cursor-pointer items-center justify-center gap-2 self-start rounded-full bg-[#CB333B] px-5 py-3 font-sans text-lg font-medium text-stone-100 shadow-md transition-colors duration-200 hover:bg-[#A4343A]"
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
          id={action ? 'mux-action-button' : 'watch-now-button'}
          className={clsx(
            'z-1 hidden items-center justify-center gap-2 px-5 py-3 md:inline-flex',
            'bg-[#CB333B] text-lg font-medium text-stone-100',
            'rounded-full shadow-md transition-colors duration-200',
            'cursor-pointer self-start font-sans no-underline hover:bg-[#A4343A]',
            'animate-fade-in-up animation-delay-500 z-100'
          )}
        >
          <PlayArrowRounded fontSize="medium" className="-ml-1" />
          {action?.label || t('Watch Now')}
        </NextLink>
      )}

      {isPreview && (onMuteToggle != null || onSkip != null) && (
        <div className="absolute right-0 bottom-7 z-50 flex scale-150 items-center gap-2">
          {onSkip != null && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                onSkip()
              }}
              className="z-50 cursor-pointer rounded-full p-2 text-stone-50/50 transition-colors duration-200 hover:text-stone-50"
              aria-label={t('Skip video')}
            >
              <SkipNextRounded fontSize="medium" />
            </button>
          )}
          {onMuteToggle != null && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                onMuteToggle()
              }}
              className="mute-preview-toggle cursor-pointer rounded-full p-2 text-stone-50/50 transition-colors duration-200 hover:text-stone-50"
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
