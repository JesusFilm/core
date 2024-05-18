export const fallbackLng = 'en'
export const languages = [fallbackLng]
export const defaultNS = 'translation'
export const cookieName = 'i18next'

interface Options {
  supportedLngs: string[]
  fallbackLng: string
  lng: string
  fallbackNS: string
  defaultNS: string
  ns: string
}

export function getOptions(lng = fallbackLng, ns = defaultNS): Options {
  return {
    // debug: true,
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns
  }
}
