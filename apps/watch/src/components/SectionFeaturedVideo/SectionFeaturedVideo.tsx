import last from 'lodash/last'
import { useTranslation } from 'next-i18next'
import {
  type ReactElement,
  useEffect,
  useMemo,
  useRef
} from 'react'
import videojs from 'video.js'
import type Player from 'video.js/dist/types/player'

import 'video.js/dist/video-js.css'

import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'

import { useFeaturedVideos } from '../VideoHero/libs/useFeaturedVideos'
import { cn } from '../../libs/cn'
import { getLabelDetails } from '../../libs/utils/getLabelDetails/getLabelDetails'
import { getWatchUrl } from '../../libs/utils/getWatchUrl'

export interface SectionFeaturedVideoProps {
  className?: string
}

function useVideoPlayer(source?: string, poster?: string): React.RefObject<HTMLVideoElement> {
  const videoElementRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<Player | null>(null)

  useEffect(() => {
    if (videoElementRef.current == null || playerRef.current != null) return

    playerRef.current = videojs(videoElementRef.current, {
      controls: true,
      autoplay: false,
      preload: 'metadata',
      responsive: true,
      fluid: true,
      controlBar: {
        pictureInPictureToggle: false
      }
    })

    return () => {
      playerRef.current?.dispose()
      playerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (playerRef.current == null) return

    if (source != null && source !== '') {
      playerRef.current.src({
        src: source,
        type: 'application/x-mpegURL'
      })
    }

    if (poster != null && poster !== '') {
      playerRef.current.poster(poster)
    }
  }, [source, poster])

  return videoElementRef
}

export function SectionFeaturedVideo({
  className
}: SectionFeaturedVideoProps): ReactElement | null {
  const { t, i18n } = useTranslation('apps-watch')
  const { videos, loading } = useFeaturedVideos(i18n.language)

  const featuredVideo = videos[0]
  const videoSource = featuredVideo?.variant?.hls ?? undefined
  const poster = useMemo(
    () => last(featuredVideo?.images)?.mobileCinematicHigh ?? undefined,
    [featuredVideo]
  )
  const videoRef = useVideoPlayer(videoSource, poster)

  const title = useMemo(() => {
    if (featuredVideo == null) return undefined
    return last(featuredVideo.title)?.value ?? t('Untitled Video', 'Untitled Video')
  }, [featuredVideo, t])

  const snippet = featuredVideo?.snippet?.find((item) => item.value !== '')?.value

  const { label: labelText } = useMemo(
    () =>
      getLabelDetails(
        t,
        featuredVideo?.label,
        featuredVideo?.childrenCount ?? 0
      ),
    [featuredVideo?.childrenCount, featuredVideo?.label, t]
  )

  const duration = useMemo(
    () =>
      secondsToTimeFormat(featuredVideo?.variant?.duration ?? 0, {
        trimZeroes: true
      }),
    [featuredVideo?.variant?.duration]
  )

  const shareHref = useMemo(
    () =>
      featuredVideo?.variant?.slug != null
        ? getWatchUrl(undefined, featuredVideo.label, featuredVideo.variant.slug)
        : undefined,
    [featuredVideo]
  )

  if (!loading && (featuredVideo == null || videoSource == null)) return null

  return (
    <section
      className={cn(
        'relative overflow-hidden bg-linear-to-br from-blue-950/80 via-purple-900/70 to-[#6C1E3E]/80 py-16 text-white',
        className
      )}
      data-testid="SectionFeaturedVideo"
    >
      <div className="absolute inset-0 bg-[url(/watch/assets/overlay.svg)] bg-repeat mix-blend-lighten opacity-40" />
      <div className="padded relative z-10 grid gap-12 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/60 shadow-xl">
          {featuredVideo != null && videoSource != null ? (
            <div className="relative aspect-video">
              <video
                ref={videoRef}
                className="video-js vjs-big-play-centered h-full w-full"
                controls
                playsInline
                data-testid="SectionFeaturedVideoPlayer"
              />
            </div>
          ) : (
            <div
              className="aspect-video w-full animate-pulse bg-white/10"
              data-testid="SectionFeaturedVideoSkeleton"
            />
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-100/70">
              {t("Today's Featured Video", "Today's Featured Video")}
            </p>
            <h2 className="text-3xl font-bold leading-tight">
              {featuredVideo != null ? (
                title
              ) : (
                <span className="inline-flex h-8 w-2/3 animate-pulse rounded bg-white/20" />
              )}
            </h2>
            {snippet != null && snippet !== '' && (
              <p className="text-base leading-relaxed text-stone-200/80">{snippet}</p>
            )}
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <dt className="text-xs font-semibold uppercase tracking-widest text-stone-200/70">
                {t('Duration', 'Duration')}
              </dt>
              <dd className="mt-1 text-lg font-semibold text-white">{duration}</dd>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <dt className="text-xs font-semibold uppercase tracking-widest text-stone-200/70">
                {t('Video Type', 'Video Type')}
              </dt>
              <dd className="mt-1 text-lg font-semibold text-white">{labelText}</dd>
            </div>
          </dl>

          <div className="rounded-3xl border border-white/10 bg-black/60 p-6 shadow-inner">
            <h3 className="text-xl font-semibold">
              {t('Share with a friend', 'Share with a friend')}
            </h3>
            <p className="mt-2 text-base leading-relaxed text-stone-200/80">
              {t(
                'Featured video share instructions',
                'Share this story by using the player share controls or copying the link to send it to someone you care about.'
              )}
            </p>
            {shareHref != null && (
              <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
                <code className="flex-1 truncate rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/90">
                  {shareHref}
                </code>
                <a
                  href={shareHref}
                  className="inline-flex items-center justify-center rounded-full bg-white/90 px-5 py-2 text-sm font-semibold text-black transition hover:bg-white"
                  data-analytics-tag="featured-video-share-link"
                >
                  {t('Open video page', 'Open video page')}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
