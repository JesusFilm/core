import { useEffect, useState } from 'react'

import { LANGUAGE_MAPPINGS, SUPPORTED_LOCALES } from '../localeMapping'

type MaybeLocale = string | undefined

const SUPPORTED_LOCALE_LOOKUP = new Map(
  SUPPORTED_LOCALES.map((locale) => [locale.toLowerCase(), locale])
)

function findLocaleByRegion(region: string, base?: string): MaybeLocale {
  const normalizedRegion = region.toLowerCase()
  const normalizedBase = base?.toLowerCase()

  for (const locale of SUPPORTED_LOCALES) {
    if (
      normalizedBase != null &&
      locale.split('-')[0]?.toLowerCase() !== normalizedBase
    ) {
      continue
    }

    const mapping = LANGUAGE_MAPPINGS[locale]
    if (mapping?.geoLocations.some((code) => code.toLowerCase() === normalizedRegion)) {
      return locale
    }
  }

  return undefined
}

function mapToSupportedLocale(language: string): MaybeLocale {
  if (language == null || language === '') return undefined

  const normalized = language.replace(/_/g, '-').toLowerCase()
  const exactMatch = SUPPORTED_LOCALE_LOOKUP.get(normalized)
  if (exactMatch != null) return exactMatch

  const parts = normalized.split('-').filter(Boolean)
  const base = parts[0]

  if (parts.length > 1) {
    const possibleRegion = parts[parts.length - 1]
    if (possibleRegion.length === 2) {
      const regionMatch = findLocaleByRegion(possibleRegion, base)
      if (regionMatch != null) return regionMatch
    }
  }

  if (base == null || base === '') return undefined

  return SUPPORTED_LOCALE_LOOKUP.get(base) ?? undefined
}

export function getPreferredLocaleFromLanguages(
  languages: readonly string[]
): MaybeLocale {
  for (const language of languages) {
    const supportedLocale = mapToSupportedLocale(language)
    if (supportedLocale != null) return supportedLocale
  }

  return undefined
}

export function getBrowserPreferredLocale(): MaybeLocale {
  if (typeof navigator === 'undefined') return undefined

  const languages: string[] = []
  if (Array.isArray(navigator.languages)) {
    languages.push(...navigator.languages)
  }

  if (typeof navigator.language === 'string') {
    languages.push(navigator.language)
  }

  return getPreferredLocaleFromLanguages(languages)
}

export function usePreferredLocale(): MaybeLocale {
  const [preferredLocale, setPreferredLocale] = useState<MaybeLocale>(() =>
    getBrowserPreferredLocale()
  )

  useEffect(() => {
    if (typeof navigator === 'undefined') return

    setPreferredLocale(getBrowserPreferredLocale())
  }, [])

  return preferredLocale
}

export { mapToSupportedLocale }
