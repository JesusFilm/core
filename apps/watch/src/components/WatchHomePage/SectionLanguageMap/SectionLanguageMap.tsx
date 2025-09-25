import dynamic from 'next/dynamic'
import { useTranslation } from 'next-i18next'
import type { ReactElement } from 'react'

import { cn } from '../../../libs/cn'
import { useLanguageMap } from '../../../libs/useLanguageMap'

const LanguageMap = dynamic(
  async () =>
    await import(/* webpackChunkName: "watch-language-map" */ './LanguageMap').then(
      (module) => module.LanguageMap
    ),
  {
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-900/40" />
  }
)

export function SectionLanguageMap(): ReactElement {
  const { t } = useTranslation('apps-watch')
  const { points, isLoading, error } = useLanguageMap()

  const hasData = points.length > 0

  return (
    <section
      aria-labelledby="watch-language-map-heading"
      className="flex w-full flex-col gap-8 py-16 text-white"
    >
      <div className="max-w-3xl space-y-4">
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
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 shadow-2xl',
          'before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.35),_transparent_60%)] before:content-[""]'
        )}
      >
        <div className="aspect-[16/9] md:h-[520px]">
          {hasData ? (
            <LanguageMap
              points={points}
              unsupportedMessage={t('Interactive map is not supported on this device.')}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm text-white/70">
              {error != null && !isLoading
                ? t('We had trouble loading the language map. Please try again later.')
                : t('Loading language coverage…')}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
