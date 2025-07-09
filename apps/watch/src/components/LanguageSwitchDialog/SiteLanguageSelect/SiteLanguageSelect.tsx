import { useTranslation } from 'next-i18next'
import { ReactElement, memo, useEffect, useState } from 'react'

import Globe from '@core/shared/ui/icons/Globe'
import {
  LanguageAutocomplete,
  LanguageOption
} from '@core/shared/ui/LanguageAutocomplete'

import {
  LANGUAGE_MAPPINGS,
  SUPPORTED_LOCALES
} from '../../../libs/localeMapping'
import { useLanguageActions, useWatch } from '../../../libs/watchContext'
import { renderInput } from '../utils/renderInput'
import { renderOption } from '../utils/renderOption'
import {
  ExtendedLanguageOption,
  siteLanguageReorder
} from '../utils/siteLanguageReorder'

export const SiteLanguageSelect = memo(
  function SiteLanguageSelect(): ReactElement {
    const { i18n, t } = useTranslation()
    const { state } = useWatch()
    const { updateSiteLanguage } = useLanguageActions()
    const [languages, setLanguages] = useState<ExtendedLanguageOption[]>([])
    const currentLanguageId = i18n?.language ?? 'en'
    const [currentLanguage, setCurrentLanguage] =
      useState<LanguageOption | null>(null)

    useEffect(() => {
      let siteLang: LanguageOption | null = null
      const formattedLanguages = SUPPORTED_LOCALES.map((l) => {
        const { locale, localName, nativeName, languageSlugs } =
          LANGUAGE_MAPPINGS[l]
        if (locale === currentLanguageId) {
          siteLang = {
            id: locale,
            localName,
            nativeName,
            slug: languageSlugs[0]
          }
          setCurrentLanguage(siteLang)
        }

        return {
          id: locale,
          localName,
          nativeName,
          slug: languageSlugs[0]
        }
      })

      const fetchGeolocationAndSetLanguages = async () => {
        try {
          // Fetch country from geolocation API
          const countryResponse = await fetch('/api/geolocation')
          const { country } = await countryResponse.json()
          const browserLanguage = navigator.language || navigator.languages[0]

          // Reorder languages using utility function
          const finalLanguages = siteLanguageReorder({
            languages: formattedLanguages,
            siteLang,
            browserLanguage,
            country
          })

          setLanguages(finalLanguages)
        } catch {
          // If geolocation fails, still use the utility function for consistency
          const finalLanguages = siteLanguageReorder({
            languages: formattedLanguages,
            siteLang,
            browserLanguage: undefined,
            country: undefined
          })
          setLanguages(finalLanguages)
        }
      }
      void fetchGeolocationAndSetLanguages()
    }, [i18n?.language])

    const handleLanguageChange = (language?: LanguageOption): void => {
      if (!language) return
      // Only process actual language items, skip headers and dividers
      if (!language.id.startsWith('__')) {
        setCurrentLanguage(language)
        updateSiteLanguage(language.id)
      }
    }

    return (
      <div className="mx-6">
        <label
          htmlFor="language-select"
          className="block text-xl font-medium text-gray-700 ml-7"
        >
          {t('Site Language')}
        </label>
        <div className="relative mt-1 flex items-start gap-2">
          <div className="pt-4">
            <Globe fontSize="small" />
          </div>
          <div className="relative w-full">
            <LanguageAutocomplete
              value={{
                id: currentLanguage?.id ?? 'en',
                nativeName: currentLanguage?.nativeName ?? 'English',
                localName: currentLanguage?.localName ?? 'English'
              }}
              onChange={(language) => handleLanguageChange(language)}
              languages={languages.map((item, index) => {
                // Handle headers and dividers
                if (item.type === 'header' || item.type === 'divider') {
                  return {
                    id: item.id,
                    name: [
                      {
                        value:
                          item.id === '__header_suggested__'
                            ? t('Suggested:')
                            : '',
                        primary: true
                      },
                      { value: '', primary: false }
                    ],
                    slug: null,
                    __type: item.type
                  }
                }

                // Handle regular language items
                const { id, localName, nativeName, slug } = item
                return {
                  id,
                  name: [
                    { value: localName ?? 'English', primary: true },
                    { value: nativeName ?? 'English', primary: false }
                  ],
                  slug: slug ?? null,
                  __type: 'language'
                }
              })}
              disabled={state.loading}
              loading={state.loading}
              disableSort={true}
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
)
