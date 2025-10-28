'use client'

import { useTranslation } from 'next-i18next'
import type { ReactElement } from 'react'
import { useMemo } from 'react'

import { cn } from '../../../libs/cn'
import { useLanguageMap } from '../../../libs/useLanguageMap'

import { LanguageMap } from './LanguageMap'

export function SectionLanguageMap(): ReactElement {
  const { t } = useTranslation('apps-watch')
  const { points, isLoading, error, retry } = useLanguageMap()

  const hasData = points.length > 0
  const uniqueLanguagesCount = useMemo(() => {
    const uniqueLanguageIds = new Set(points.map(point => point.languageId))
    return uniqueLanguageIds.size
  }, [points])

  return (
    <section
      aria-labelledby="watch-language-map-heading"
      className="flex w-full flex-col gap-8 pt-16 text-white"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl space-y-4 padded">
          <h2
            id="watch-language-map-heading"
            className="text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            {t('Explore languages worldwide')}
          </h2>
          <p className="text-base text-white/80 sm:text-lg">
            {t(
              'Discover where the JESUS Film is available and see how the gospel is being shared across every continent.'
            )}
          </p>
        </div>
        {hasData && (
          <div className="flex-shrink-0 rounded-lg p-4 text-center sm:p-6">
            <div className="text-4xl font-medium text-white ">
              {uniqueLanguagesCount.toLocaleString()}
            </div>
            <div className="text-sm text-white/60 sm:text-base">
              {t('translations')}
            </div>
          </div>
        )}
      </div>
      <div
        className={cn(
          'relative w-full overflow-hidden  bg-slate-900/60 shadow-2xl',
          'before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.35),_transparent_60%)] before:content-[""]'
        )}
      >
        <div className="w-full h-[700px]">
          {hasData ? (
            <LanguageMap
              points={points}
              unsupportedMessage={t('Interactive map is not supported on this device.')}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm text-white/70">
              {error != null && !isLoading ? (
                <div className="flex flex-col items-center gap-4">
                  <p className="max-w-sm text-balance">
                    {t('We had trouble loading the language map. Please try again later.')}
                  </p>
                  <button
                    type="button"
                    onClick={retry}
                    disabled={isLoading}
                    className="rounded-full border border-white/30 px-5 py-2 text-sm font-medium text-white transition hover:border-white/60 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t('Try again')}
                  </button>
                </div>
              ) : (
                t('Loading language coverage…')
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
