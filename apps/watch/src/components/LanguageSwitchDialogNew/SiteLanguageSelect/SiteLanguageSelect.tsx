import { useTranslation } from 'next-i18next'
import { ReactElement, Ref, useEffect, useState } from 'react'

import Globe from '@core/shared/ui/icons/Globe'
import {
  LanguageAutocomplete,
  LanguageOption
} from '@core/shared/ui/LanguageAutocomplete'

import { LANGUAGE_MAPPINGS, SUPPORTED_LOCALES } from '../../../config/locales'
import { renderInput } from '../utils/renderInput'
import { renderOption } from '../utils/renderOption'

interface SiteLanguageSelectProps {
  onChange: (value: string) => void
  dropdownRef: Ref<HTMLDivElement>
}

export function SiteLanguageSelect({
  onChange,
  dropdownRef
}: SiteLanguageSelectProps): ReactElement {
  const { i18n, t } = useTranslation()
  const [languages, setLanguages] = useState<LanguageOption[]>([])
  const currentLanguageId = i18n?.language ?? 'en'
  const [currentLanguage, setCurrentLanguage] = useState<LanguageOption | null>(
    null
  )

  useEffect(() => {
    const formattedLanguages = SUPPORTED_LOCALES.map((l) => {
      const { locale, localName, nativeName, languageSlugs } =
        LANGUAGE_MAPPINGS[l]
      if (locale === currentLanguageId) {
        setCurrentLanguage({
          id: locale,
          localName,
          nativeName,
          slug: languageSlugs[0]
        })
      }

      return {
        id: locale,
        localName,
        nativeName,
        slug: languageSlugs[0]
      }
    })

    setLanguages(formattedLanguages)
  }, [i18n?.language])

  const handleLanguageChange = (language?: LanguageOption): void => {
    if (!language) return
    setCurrentLanguage(language)
    onChange(language.id)
  }

  return (
    <div className="mx-6">
      <label
        htmlFor="language-select"
        className="block text-sm font-medium text-gray-700 ml-7"
      >
        {t('Site Language')}
      </label>
      <div className="relative mt-1 flex items-center gap-2" ref={dropdownRef}>
        <Globe fontSize="small" />
        <div className="relative w-full">
          <LanguageAutocomplete
            value={{
              id: currentLanguage?.id ?? 'en',
              nativeName: currentLanguage?.nativeName ?? 'English',
              localName: currentLanguage?.localName ?? 'English'
            }}
            onChange={(language) => handleLanguageChange(language)}
            languages={languages.map(({ id, localName, nativeName, slug }) => ({
              id,
              name: [
                { value: localName ?? 'English', primary: true },
                { value: nativeName ?? 'English', primary: false }
              ],
              slug: slug ?? null
            }))}
            disabled={false}
            renderInput={renderInput(
              t('{{count}} languages', { count: SUPPORTED_LOCALES.length })
            )}
            renderOption={renderOption}
          />
        </div>
      </div>
    </div>
  )
}
