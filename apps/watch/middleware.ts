import { NextRequest, NextResponse } from 'next/server'

import { DEFAULT_LOCALE, LANGUAGE_MAPPINGS } from './src/libs/localeMapping'

function getLocaleFromPath(pathname: string): string | undefined {
  const parts = pathname.split('/').filter(Boolean)
  const pathParts = parts.slice(1)
  const lastPart = pathParts[pathParts.length - 1]?.split('?')[0]

  const localeEntry = Object.values(LANGUAGE_MAPPINGS).find((mapping) =>
    mapping.languageSlugs.includes(lastPart)
  )

  return localeEntry?.locale
}

function getLocale(req: NextRequest): string {
  // Only URL Path should determine language
  const pathLocale = getLocaleFromPath(req.nextUrl.pathname)
  if (pathLocale != null) return pathLocale

  return DEFAULT_LOCALE
}

export function middleware(req: NextRequest): NextResponse | undefined {
  const isNextInternal = req.nextUrl.pathname.startsWith('/_next')
  const isApi = req.nextUrl.pathname.includes('/api/')
  const isWatchRoute = req.nextUrl.pathname.startsWith('/watch')
  const isAsset = req.nextUrl.pathname.includes('/assets/')

  if (isNextInternal || isApi || !isWatchRoute || isAsset) {
    return
  }

  const locale = getLocale(req)

  if (locale !== DEFAULT_LOCALE) {
    const rewriteUrl = req.nextUrl.clone()
    const cleanPathname = req.nextUrl.pathname.split('?')[0]
    rewriteUrl.pathname = `/${locale}${cleanPathname}`

    return NextResponse.rewrite(rewriteUrl)
  }

  return NextResponse.next()
}
