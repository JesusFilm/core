import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_FILE_REGEX = /\.(.*)$/

const getBrowserLanguage = (req): string | undefined => {
  const acceptedLanguages = req.headers
    .get('accept-language')
    ?.split(',')
    .map((item) => {
      const [code, priority] = item.trim().split(';')
      const langPriority =
        priority != null ? parseFloat(priority.split('=')[1]) : 1
      return { code, priority: isNaN(langPriority) ? 1 : langPriority }
    })

  const sortedLanguages = acceptedLanguages?.sort(
    (a, b) => b.priority - a.priority
  )

  if (sortedLanguages != null && sortedLanguages.length > 0) {
    return sortedLanguages[0].code
  }

  return undefined
}

export function middleware(req: NextRequest): NextResponse | undefined {
  if (
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.includes('/api/') ||
    PUBLIC_FILE_REGEX.test(req.nextUrl.pathname)
  ) {
    return
  }

  const nextLocale = req.nextUrl.locale
  const browserLanguage = getBrowserLanguage(req)
  const nextLocaleCookie = req.cookies.get('NEXT_LOCALE')?.value

  function handleRedirect(locale?: string): NextResponse {
    const redirectUrl = new URL(
      `/${locale}${req.nextUrl.pathname}${req.nextUrl.search}`,
      req.url
    )
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect if the NEXT_LOCALE cookie is set and does not match the current locale
  if (nextLocaleCookie != null && nextLocaleCookie !== nextLocale) {
    return handleRedirect(nextLocaleCookie)
  }

  // Redirect if NEXT_LOCALE cookie is not set and browser language is different from current locale
  if (nextLocaleCookie == null && browserLanguage !== nextLocale) {
    return handleRedirect(browserLanguage)
  }
}
