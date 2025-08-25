import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import {
  DEFAULT_LOCALE,
  LANGUAGE_MAPPINGS,
  SUPPORTED_LOCALES
} from './src/libs/localeMapping'

// Zod schema for validating Redis cached data (new object format)
const VariantLanguagesObjectSchema = z.record(z.string(), z.string())

interface LanguagePriority {
  code: string
  priority: number
}

let _redis: Redis | undefined
function redisClient(): Redis {
  if (_redis == null || process.env.NODE_ENV === 'test') {
    _redis = new Redis({
      url:
        process.env.REDIRECT_STORAGE_KV_REST_API_URL ??
        'http://serverless-redis-http:80',
      token: process.env.REDIRECT_STORAGE_KV_REST_API_TOKEN ?? 'example_token'
    })
  }
  return _redis
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

export const AUDIO_LANGUAGE_REDIRECT_CACHE_SCHEMA_VERSION = `2025-08-25`

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
      const cacheKey = `variantLanguages:${AUDIO_LANGUAGE_REDIRECT_CACHE_SCHEMA_VERSION}:${videoSlug}`

      // If not cached, fetch from API

      let exists = false
      try {
        exists = (await redis.exists(cacheKey)) > 0
      } catch (error) {
        console.error('Redis exists check error:', error)
      }

      if (!exists) {
        try {
          const response = await fetch(
            `${req.nextUrl.origin}/api/variantLanguages?slug=${videoSlug}/${audioLanguage}`
          )
          if (response.ok) {
            const data = await response.json()
            const {
              success,
              data: variantLanguages,
              error
            } = VariantLanguagesObjectSchema.safeParse(
              data.data?.variantLanguages
            )

            if (!success) {
              console.error(
                'API variantLanguages data validation error:',
                error
              )
              return
            }

            // Cache the result
            try {
              await redis.hset(cacheKey, variantLanguages)
              await redis.expire(cacheKey, CACHE_TTL)
            } catch (error) {
              console.error('Redis cache hset or expire error:', error)
            }
          }
        } catch (error) {
          console.error('API variantLanguages fetch error:', error)
        }
      }

      let slug: string | null | undefined

      try {
        slug = await redis.hget(cacheKey, audioLanguageId)
      } catch (error) {
        console.error('Redis cache hget error:', error)
      }

      if (slug != null && audioLanguage != slug) {
        const newPath = `/${pathParts.slice(0, -1).join('/')}/${slug}.html`
        return NextResponse.redirect(new URL(newPath, req.url))
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
