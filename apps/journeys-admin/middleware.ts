import { NextRequest, NextResponse } from 'next/server'

export const supportedLocales = [
  // Amharic
  'am',
  'am-ET',

  // Arabic
  'ar',
  'ar-BH', // Bahrain
  'ar-EG', // Egypt
  'ar-SA', // Saudi Arabia
  'ar-YE', // Yemen

  // Bengali
  'bn',
  'bn-BD', // Bangla
  'bn-IN', // Indian

  // English
  'en',
  'en-AU', // Australia
  'en-CA', // Canada
  'en-GB', // United Kingdom
  'en-NZ', // New Zealand
  'en-US', // United States

  // Spanish
  'es',
  'es-ES',
  'es-AR', // Argentina
  'es-CO', // Columbia
  'es-MX', // Mexico
  'es-PE', // Peru
  'es-US', // USA
  'es-VE', // Venezuela
  'es-419', // Latin, America

  // French
  'fr',
  'fr-FR',
  'fr-BE', // Belgium
  'fr-CA', // Canada
  'fr-LU', // Luxembourg
  'fr-QC', // Quebec
  'fr-CH', // Switzerland

  // Hindi
  'hi',
  'hi-IN',

  // Indonesia
  'id',
  'id-ID',

  // Japanese
  'ja',
  'ja-JP',

  // Burmese
  'my',
  'my-MM',

  // Russian
  'ru',
  'ru-RU',
  'ru-BY', // Belarus
  'ru-MD', // Moldova
  'ru-UA', // Ukraine

  // Thai
  'th',
  'th-TH',

  // Tagalog
  'tl',
  'tl-PH',

  // Turkish
  'tr',
  'tr-TR',
  'tr-CY', // Cyprus

  // Urdu (Pakistan)
  'ur-PK',

  // Vietnamese
  'vi',
  'vi-VN',

  // Chinese, Simplified
  'zh-CN',
  'zh-SG', // Singapore

  // Chinese, Traditional
  'zh-TW',
  'zh-HK', // Hongkong
  'zh-MO' // Macao
]

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
    const browserCode = sortedLanguages[0].code
    console.log(browserCode)

    if (supportedLocales.includes(browserCode)) {
      return browserCode
    }
  }

  return 'en'
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
