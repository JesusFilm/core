import path from 'path'

import { InitOptions } from 'i18next'

export const fallbackLanguageId = 'en'
export const languages = [fallbackLanguageId]
export const defaultNS = 'apps-watch'
export const cookieName = 'i18next'

const isBrowser = typeof window !== 'undefined'
let localePath
if (isBrowser) {
  // browser
  localePath = './public/locales'
} else if (process.env.VERCEL == null || process.env.CI != null) {
  // not vercel or vercel build time
  localePath = path.resolve('../../libs/locales')
} else {
  // vercel run time
  localePath = path.resolve('./public/locales')
}

export const localePathPublic = localePath

export function getOptions(
  languageId = fallbackLanguageId,
  ns = defaultNS
): InitOptions {
  return {
    // debug: true,
    supportedLngs: languages,
    fallbackLng: fallbackLanguageId,
    lng: languageId,
    fallbackNS: defaultNS,
    defaultNS,
    ns
  }
}
