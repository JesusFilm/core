'use client'

import { useTranslation } from 'next-i18next'
import type { ReactElement } from 'react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import { cn } from '../../../libs/cn'
import { useCountryLanguages } from '../../../libs/useCountryLanguages'
import { useLanguageMap } from '../../../libs/useLanguageMap'

import { LanguageMap } from './LanguageMap'

export function SectionLanguageMap(): ReactElement {
  const { t } = useTranslation('apps-watch')
  const { points, isLoading, error } = useLanguageMap()
  const [selectedCountry, setSelectedCountry] = useState<{
    id: string
    name?: string
  } | null>(null)

  const {
    languages,
    countryName: fetchedCountryName,
    isLoading: isCountryLoading,
    error: countryError
  } = useCountryLanguages(selectedCountry?.id)

  const hasData = points.length > 0
  const uniqueLanguagesCount = useMemo(() => {
    const uniqueLanguageIds = new Set(points.map(point => point.languageId))
    return uniqueLanguageIds.size
  }, [points])

  const displayCountryName = fetchedCountryName ?? selectedCountry?.name
  const hasSelectedCountry = selectedCountry != null

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
              onCountrySelect={setSelectedCountry}
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
      <div className="w-full rounded-2xl bg-slate-900/60 p-6 shadow-2xl">
        {hasSelectedCountry ? (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h3 className="text-2xl font-semibold tracking-tight">
                  {displayCountryName != null
                    ? t('Languages in {{country}}', { country: displayCountryName })
                    : t('Languages in this country')}
                </h3>
                <p className="text-sm text-white/70 sm:text-base">
                  {countryError != null
                    ? t('We could not load languages for this country. Please try again later.')
                    : isCountryLoading
                    ? t('Loading languages…')
                    : t('languages available count', { count: languages.length })}
                </p>
              </div>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                onClick={() => setSelectedCountry(null)}
              >
                {t('Clear selection')}
              </button>
            </div>
            {countryError != null ? (
              <p className="text-sm text-rose-200">
                {t('We could not load languages for this country. Please try again later.')}
              </p>
            ) : isCountryLoading ? (
              <p className="text-sm text-white/70">
                {t('Loading languages…')}
              </p>
            ) : languages.length > 0 ? (
              <ul className="max-h-96 space-y-3 overflow-y-auto pr-1">
                {languages.map((language) => {
                  const showNativeName =
                    language.nativeName != null &&
                    language.nativeName !== '' &&
                    language.nativeName !== language.languageName

                  return (
                    <li
                      key={language.id}
                      className="flex flex-col gap-3 rounded-xl border border-white/5 bg-slate-900/40 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="space-y-1">
                        <p className="text-base font-semibold sm:text-lg">
                          {language.languageName}
                        </p>
                        {showNativeName ? (
                          <p className="text-sm text-white/60">
                            {language.nativeName}
                          </p>
                        ) : null}
                      </div>
                      <Link
                        href={`/watch/videos?languages=${language.id}`}
                        className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white/90"
                      >
                        {t('Browse videos in this language')}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="text-sm text-white/70">
                {t('No languages available for this country yet.')}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-white/70">
            {t('Select a country on the map to see available languages.')}
          </p>
        )}
      </div>
    </section>
  )
}
