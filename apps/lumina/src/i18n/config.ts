export type Locale = (typeof locales)[number]

export const locales = [
  'en' // English
] as const
export const defaultLocale: Locale = 'en'

