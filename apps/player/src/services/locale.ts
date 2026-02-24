'use server'

import { cookies, headers } from 'next/headers'

import type { Locale } from '@/i18n/config'
import { defaultLocale, locales } from '@/i18n/config'

const COOKIE_NAME = 'NEXT_LOCALE'

function isLocale(v: unknown): v is Locale {
  return typeof v === 'string' && locales.includes(v as Locale)
}

function parseAcceptLanguage(acceptLanguage: string): Locale {
  const languages = acceptLanguage
    .split(',')
    .map((lang) => {
      const parts = lang.trim().split(';q=')
      const language = parts[0]?.trim()
      const quality = parts[1] ? parseFloat(parts[1]) : 1
      return {
        language,
        quality
      }
    })
    .filter((lang) => lang.language)
    .sort((a, b) => b.quality - a.quality)

  for (const { language } of languages) {
    if (!language) continue
    const exactMatch = locales.find((locale) => locale === language)
    if (exactMatch) {
      return exactMatch
    }
  }

  for (const { language } of languages) {
    if (!language) continue
    const languageCode = language.split('-')[0]
    const partialMatch = locales.find((locale) => {
      const localeCode = locale.split('-')[0]
      return localeCode === languageCode
    })
    if (partialMatch) {
      return partialMatch
    }
  }

  return defaultLocale
}

export async function getUserLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const cookieValue = cookieStore.get(COOKIE_NAME)?.value

  if (isLocale(cookieValue)) {
    return cookieValue
  }

  const headersList = await headers()
  const acceptLanguage = headersList.get('accept-language')

  if (acceptLanguage == null) {
    return defaultLocale
  }

  return parseAcceptLanguage(acceptLanguage)
}

export async function setUserLocale(locale: Locale) {
  const store = await cookies()
  store.set(COOKIE_NAME, locale)
}
