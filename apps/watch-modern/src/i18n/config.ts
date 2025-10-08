export type Locale = (typeof locales)[number]

export const locales = [
  'en', // English
  'es-ES', // Spanish
  'fr-FR', // French
  'id-ID', // Indonesian
  'th-TH', // Thai
  'ja-JP', // Japanese
  'ko-KR', // Korean
  'ru-RU', // Russian
  'tl-PH', // Tagalog
  'tr-TR', // Turkish
  'zh', // Chinese
  'zh-Hans-CN' // Chinese, Simplified
] as const
export const defaultLocale: Locale = 'en'
