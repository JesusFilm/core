import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import {
  DEFAULT_LOCALE,
  LANGUAGE_MAPPINGS,
  SUPPORTED_LOCALES
} from './src/libs/localeMapping'

// Zod schema for validating Redis cached data
const VariantLanguageSchema = z.object({
  slug: z.string(),
  language: z.object({
    id: z.string()
  })
})

const VariantLanguagesArraySchema = z.array(VariantLanguageSchema)

// Type inference from the schema
type VariantLanguage = z.infer<typeof VariantLanguageSchema>

interface LanguagePriority {
  code: string
  priority: number
}

function redisClient(): Redis {
  return new Redis({
    url:
      process.env.REDIRECT_STORAGE_REDIS_URL ??
      'http://serverless-redis-http:80',
    token: process.env.REDIRECT_STORAGE_REDIS_TOKEN ?? 'example_token'
  })
}

const CACHE_TTL = 86400 // 1 day in seconds

function parseAcceptLanguageHeader(header: string): LanguagePriority[] {
  return header.split(',').map((item) => {
    const [code, priority] = item.trim().split(';')
    const langPriority =
      priority != null ? Number.parseFloat(priority.split('=')[1]) : 1
    return { code, priority: langPriority }
  })
}

function getPreferredLanguage(
  languages: LanguagePriority[] | undefined
): string | undefined {
  const preferredLanguage = languages?.find(
    (language) =>
      SUPPORTED_LOCALES.includes(language.code) ||
      SUPPORTED_LOCALES.includes(language.code.split('-')[0])
  )

  if (preferredLanguage == null) return
  return getSupportedLocale(preferredLanguage?.code)
}

function getSupportedLocale(input?: string): string {
  if (input == null) return DEFAULT_LOCALE

  const languageCode = input.split('-')[0]

  const isSupported = (code: string): boolean =>
    SUPPORTED_LOCALES.includes(code)

  return isSupported(input)
    ? input
    : isSupported(languageCode)
      ? languageCode
      : DEFAULT_LOCALE
}

function getLocaleFromPath(pathname: string): string | undefined {
  const parts = pathname.split('/').filter(Boolean)
  const pathParts = parts.slice(1)
  const lastPart = pathParts[pathParts.length - 1]

  const localeEntry = Object.values(LANGUAGE_MAPPINGS).find((mapping) =>
    mapping.languageSlugs.includes(lastPart)
  )

  return localeEntry?.locale
}

function getLocaleFromGeoHeaders(req: NextRequest): string | undefined {
  const country =
    req.headers.get('cf-ipcountry') ||
    req.headers.get('x-vercel-ip-country') ||
    undefined

  if (!country) return undefined

  const countryCode = country.toUpperCase()
  const localeEntry = Object.values(LANGUAGE_MAPPINGS).find((mapping) =>
    mapping.geoLocations.includes(countryCode)
  )

  return localeEntry?.locale
}

function getBrowserLanguage(req: NextRequest): string {
  const acceptedLanguagesHeader = req.headers.get('accept-language')
  if (acceptedLanguagesHeader == null) return DEFAULT_LOCALE

  const acceptedLanguages = parseAcceptLanguageHeader(acceptedLanguagesHeader)
  const sortedLanguages = acceptedLanguages?.sort(
    (a, b) => b.priority - a.priority
  )
  return getPreferredLanguage(sortedLanguages) ?? DEFAULT_LOCALE
}

function getLocale(req: NextRequest): string {
  // Priority 1: Cookie
  // const cookieLocale = req.cookies.get('NEXT_LOCALE')?.value?.split('---')[1]
  // if (cookieLocale != null) return cookieLocale

  // Priority 2: URL Path
  const pathLocale = getLocaleFromPath(req.nextUrl.pathname)
  if (pathLocale != null) return pathLocale

  // Priority 3: Browser Language
  const browserLocale = getBrowserLanguage(req)
  if (browserLocale !== DEFAULT_LOCALE) return browserLocale

  // Priority 4: Geolocation (only check if no other locale found)
  const geoLocale = getLocaleFromGeoHeaders(req)
  return geoLocale ?? DEFAULT_LOCALE
}

async function audioLanguageRedirect(
  req: NextRequest
): Promise<NextResponse | undefined> {
  const pathname = req.nextUrl.pathname
  const pathParts = pathname.split('/').filter(Boolean)

  if (pathParts.length === 3 || pathParts.length === 4) {
    const [videoSlug, audioLanguage] = pathParts
      .slice(-2)
      .map((part) => part.split('.').at(0))

    // Check if user has an AUDIO_LANGUAGE cookie
    const audioLanguageId = req.cookies
      .get('AUDIO_LANGUAGE')
      ?.value?.split('---')[1]

    if (audioLanguageId) {
      const redis = redisClient()
      // User's preferred language doesn't match the current path
      // Check if we have cached variant languages for this video
      const cacheKey = `variantLanguages:${videoSlug}`
      let variantLanguages: VariantLanguage[] | null = null

      try {
        const cachedData = await redis.get(cacheKey)
        if (cachedData) {
          try {
            variantLanguages = VariantLanguagesArraySchema.parse(cachedData)
          } catch (validationError) {
            console.error('Redis data validation error:', validationError)
            // Invalid cached data, will fetch fresh data from API
          }
        }
      } catch (error) {
        console.error('Redis cache error:', error)
      }

      // If not cached, fetch from API
      if (!variantLanguages) {
        try {
          const response = await fetch(
            `${req.nextUrl.origin}/api/variantLanguages?slug=${videoSlug}/${audioLanguage}`
          )
          if (response.ok) {
            const data = await response.json()
            variantLanguages = VariantLanguagesArraySchema.parse(
              data.data?.variantLanguages || []
            )

            // Cache the result
            try {
              await redis.set(cacheKey, variantLanguages, {
                ex: CACHE_TTL
              })
            } catch (error) {
              console.error('Redis cache set error:', error)
            }
          }
        } catch (error) {
          console.error('API fetch error:', error)
        }
      }

      // Check if user's preferred language is available
      if (variantLanguages) {
        const userPreferredLanguage = variantLanguages.find(
          (variant) => variant.language.id === audioLanguageId
        )

        if (
          userPreferredLanguage &&
          audioLanguage !== userPreferredLanguage.slug.split('/').at(-1)
        ) {
          // Redirect to user's preferred language
          const preferredSlug = userPreferredLanguage.slug
            .split('/')
            .map((part) => `${part}.html`)
            .join('/')
          const newPath = `/watch/${pathParts.length === 4 ? `${pathParts[1]}/` : ''}${preferredSlug}`
          return NextResponse.redirect(new URL(newPath, req.url))
        }
      }
    }
  }
}

export const config = {
  matcher: [
    {
      source: '/watch/((?!assets).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' }
      ]
    },
    {
      source: '/watch',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' }
      ]
    }
  ]
}

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const locale = getLocale(req)
  const rewriteUrl = req.nextUrl.clone()
  const pathname = req.nextUrl.pathname

  if (pathname === '/watch' && locale !== DEFAULT_LOCALE) {
    rewriteUrl.pathname = `/watch/${LANGUAGE_MAPPINGS[locale].languageSlugs[0]}`
    return NextResponse.redirect(rewriteUrl, 302)
  } else if (pathname.startsWith('/watch/')) {
    const redirect = await audioLanguageRedirect(req)
    if (redirect) return redirect
  }
  if (locale !== DEFAULT_LOCALE) {
    rewriteUrl.pathname = `/${locale}${pathname}`

    return NextResponse.rewrite(rewriteUrl)
  }

  return NextResponse.next()
}
