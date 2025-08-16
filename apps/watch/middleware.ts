import { NextRequest, NextResponse } from 'next/server'

import { DEFAULT_LOCALE, LANGUAGE_MAPPINGS } from './src/libs/localeMapping'
import languagesData from './src/libs/localeMapping/languages.json'

type LanguageName = {
  value: string
  primary: boolean
  language: {
    id: string
  }
}

type Language = {
  slug: string
  bcp47: string | null
  iso3: string
  id: string
  name: LanguageName[]
}

type LanguagesData = {
  languages: Language[]
}

type LangHit = { locale: string; index: number }

// Collect known locales so we can detect if the path is already prefixed
const KNOWN_LOCALES = new Set(
  Object.values(LANGUAGE_MAPPINGS).map((m: any) => m.locale)
)

/**
 * Find the English name for a language slug from the languages.json data
 */
function getEnglishNameFromSlug(slug: string): string | undefined {
  const language = (languagesData as LanguagesData).languages.find((lang: Language) => lang.slug === slug)
  if (!language) return undefined
  
  // Find the English name (primary=false, language.id="529" which is English)
  const englishName = language.name.find((name: LanguageName) => 
    name.primary === false && name.language.id === "529"
  )
  
  return englishName?.value
}

/**
 * Scan all path segments and find the first segment that matches a configured languageSlug.
 * Returns the locale and the index of that segment within the path.
 */
function findLanguageSlug(pathname: string): LangHit | undefined {
  const segments = pathname.split('/').filter(Boolean)
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    const mapping = Object.values(LANGUAGE_MAPPINGS).find((m: any) =>
      m.languageSlugs.includes(seg)
    ) as { locale: string } | undefined

    if (mapping) return { locale: mapping.locale, index: i }
  }
  return undefined
}

export function middleware(req: NextRequest): NextResponse | undefined {
  const { pathname } = req.nextUrl

  const isNextInternal = pathname.startsWith('/_next')
  const isApi = pathname.includes('/api/')
  const isAsset = pathname.includes('/assets/')
  const isWatchRoute = pathname.startsWith('/watch')

  if (isNextInternal || isApi || isAsset || !isWatchRoute) {
    return
  }

  const segments = pathname.split('/').filter(Boolean)

  // If already prefixed with a known locale, let it through untouched
  if (segments.length && KNOWN_LOCALES.has(segments[0])) {
    return NextResponse.next()
  }

  const hit = findLanguageSlug(pathname)
  if (!hit) {
    return NextResponse.next()
  }

  const { locale, index: langIdx } = hit
  const watchIdx = segments.indexOf('watch')

  if (watchIdx === -1) {
    return NextResponse.next()
  }

  const rewriteUrl = req.nextUrl.clone()

  // MAIN PAGE legacy format:
  //   /watch/{languageSlug}.html/…  ->  /{locale?}/watch/…  (drop the languageSlug segment)
  if (langIdx === watchIdx + 1) {
    // Ensure the URL has the language refinement param (visible to the user)
    const langSeg = segments[langIdx]
    const englishName = getEnglishNameFromSlug(langSeg) || langSeg.replace(/\.html$/, '').replace(/-/g, ' ')

    const paramKey = 'refinementList[languageEnglishName][0]'
    const hasParam = req.nextUrl.searchParams.has(paramKey)

    if (!hasParam && englishName) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.searchParams.set(paramKey, englishName)
      return NextResponse.redirect(redirectUrl)
    }

    const withoutLang = segments.slice(0, langIdx).concat(segments.slice(langIdx + 1))

    // Default locale: no prefix. Non-default: prefix with /{locale}
    if (locale !== DEFAULT_LOCALE) {
      rewriteUrl.pathname = '/' + [locale, ...withoutLang].join('/')
    } else {
      rewriteUrl.pathname = '/' + withoutLang.join('/')
    }

    return NextResponse.rewrite(rewriteUrl)
  }

  // INNER PAGE legacy format:
  //   /watch/{page}.html/{languageSlug}.html/…  ->  /{locale?}/watch/{page}.html/{languageSlug}.html/…
  // Keep the full path, only add locale prefix for non-default locales.
  if (locale !== DEFAULT_LOCALE) {
    rewriteUrl.pathname = '/' + [locale, ...segments].join('/')
    return NextResponse.rewrite(rewriteUrl)
  }

  // Default-locale inner pages can pass through unchanged
  return NextResponse.next()
}
