'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'

/**
 * Language switcher component that allows users to switch between different locales
 * @returns {JSX.Element} The language switcher component
 */
export default function LanguageSwitcher(): JSX.Element {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations('apps-watch-modern')

  const locales = [
    { code: 'en', name: 'English' },
    { code: 'es-ES', name: 'Español' },
    { code: 'fr-FR', name: 'Français' },
    { code: 'id-ID', name: 'Bahasa Indonesia' },
    { code: 'th-TH', name: 'ไทย' },
    { code: 'ja-JP', name: '日本語' },
    { code: 'ko-KR', name: '한국어' },
    { code: 'ru-RU', name: 'Русский' },
    { code: 'tr-TR', name: 'Türkçe' },
    { code: 'zh', name: '中文' },
    { code: 'zh-Hans-CN', name: '简体中文' }
  ]

  const handleLanguageChange = (newLocale: string) => {
    // Remove the current locale from the pathname to get the base path
    const pathnameWithoutLocale = pathname.replace(`/${locale}`, '') || '/'
    const newPath = `/${newLocale}${pathnameWithoutLocale}`
    router.push(newPath)
  }

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">{t('Language')}:</span>
        <select
          className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={locale}
          onChange={(e) => handleLanguageChange(e.target.value)}
        >
          {locales.map((loc) => (
            <option key={loc.code} value={loc.code}>
              {loc.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
