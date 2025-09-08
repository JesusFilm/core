'use server'

import { cookies, headers } from 'next/headers'

import type { Locale } from '@/i18n/config'
import { defaultLocale, locales } from '@/i18n/config'

const COOKIE_NAME = 'NEXT_LOCALE'

/**
 * Parses Accept-Language header and returns the best matching locale
 * @param acceptLanguage - The Accept-Language header value
 * @returns The best matching locale or defaultLocale if no match found
 */
function parseAcceptLanguage(acceptLanguage: string): Locale {
  // Parse Accept-Language header (e.g., "en-US,en;q=0.9,es;q=0.8")
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
    .filter((lang) => lang.language) // Filter out invalid entries
    .sort((a, b) => b.quality - a.quality) // Sort by quality (highest first)

  // Try to find exact matches first
  for (const { language } of languages) {
    if (!language) continue
    const exactMatch = locales.find((locale) => locale === language)
    if (exactMatch) {
      return exactMatch
    }
  }

  // Try to find partial matches (e.g., "en" matches "en", "en-US", etc.)
  for (const { language } of languages) {
    if (!language) continue
    const languageCode = language.split('-')[0] // Get base language code
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

/**
 * Gets the user's preferred locale from cookie or Accept-Language header
 * @returns The user's preferred locale or defaultLocale if no valid cookie or Accept-Language header found
 */
export async function getUserLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const cookieValue = cookieStore.get(COOKIE_NAME)?.value

  if (cookieValue != null && locales.includes(cookieValue as Locale)) {
    return cookieValue as Locale
  }

  // Fall back to Accept-Language header if no valid cookie
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
