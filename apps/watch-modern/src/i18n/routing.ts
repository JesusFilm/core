import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: [
    'en', // English
    'es-ES', // Spanish
    'fr-FR', // French
    'id-ID', // Indonesian
    'th-TH', // Thai
    'ja-JP', // Japanese
    'ko-KR', // Korean
    'ru-RU', // Russian
    'tr-TR', // Turkish
    'zh', // Chinese
    'zh-Hans-CN' // Chinese, Simplified
  ],

  // Used when no locale matches
  defaultLocale: 'en'
})
