import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { ReactElement, RefObject } from 'react'

import { secondsToTimeFormat } from '@core/shared/ui/timeFormat'

import { NextUpVideo } from '../types'

interface UpNextPanelProps {
  open: boolean
  countdown: number | null
  nextVideo: NextUpVideo | null
  onCancel: () => void
  onPlayNow: () => void
  panelRef: RefObject<HTMLDivElement>
}

export function UpNextPanel({
  open,
  countdown,
  nextVideo,
  onCancel,
  onPlayNow,
  panelRef
}: UpNextPanelProps): ReactElement | null {
  const { t } = useTranslation('apps-watch')

  if (nextVideo == null) return null

  const titleId = 'up-next-title'
  const countdownMessage =
    countdown != null && countdown > 0
      ? t('Next video will play in {{count}} seconds', {
          count: countdown
        })
      : t('Next video will start soon')

  return (
    <aside
      ref={panelRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      tabIndex={-1}
      className={`absolute top-0 right-0 h-full w-full md:w-[360px] max-w-full z-[200]
        bg-[#1b1616]/95 backdrop-blur-xl text-white transition-transform duration-500 ease-out
        flex flex-col gap-6 p-6 md:p-8 shadow-[0_0_32px_rgba(0,0,0,0.6)]
        ${open ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'}`}
      data-testid="UpNextPanel"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-100/80">
        {t('Up next')}
      </p>
      <div className="flex flex-col gap-4">
        <h2
          id={titleId}
          className="text-2xl font-semibold leading-tight text-white"
        >
          {nextVideo.title}
        </h2>
        <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40">
          {nextVideo.image != null ? (
            <Image
              src={nextVideo.image}
              alt={nextVideo.imageAlt ?? nextVideo.title}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 360px, 100vw"
            />
          ) : (
            <div className="aspect-video" aria-hidden />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          {nextVideo.durationSeconds != null && nextVideo.durationSeconds > 0 && (
            <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold">
              {t('Duration {{duration}}', {
                duration: secondsToTimeFormat(nextVideo.durationSeconds, {
                  trimZeroes: true
                })
              })}
            </span>
          )}
        </div>
      </div>
      <p
        className="text-sm text-gray-100"
        aria-live="polite"
        data-testid="UpNextCountdownMessage"
      >
        {countdownMessage}
      </p>
      <div className="mt-auto flex flex-col gap-3 text-center md:text-left">
        <button
          type="button"
          onClick={onPlayNow}
          className="rounded-full bg-red-500 px-6 py-3 font-semibold uppercase tracking-widest text-sm transition-colors duration-200 hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-200"
        >
          {t('Play now')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-white/30 px-6 py-3 font-semibold uppercase tracking-widest text-sm text-white transition-colors duration-200 hover:border-white/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
        >
          {t('Cancel autoplay')}
        </button>
      </div>
    </aside>
  )
}
