import { AutocompleteRenderInputParams } from '@mui/material/Autocomplete'
import { useTranslation } from 'next-i18next'
import { ReactElement, Ref, useEffect, useState } from 'react'
import { ListChildComponentProps } from 'react-window'

import Globe from '@core/shared/ui/icons/Globe'
import { LanguageAutocomplete } from '@core/shared/ui/LanguageAutocomplete'

import { SUPPORTED_LOCALES } from '../../../config/locales'

interface SiteLanguageSelectProps {
  onChange: (value: string) => void
  dropdownRef: Ref<HTMLDivElement>
  renderInput: (params: AutocompleteRenderInputParams) => ReactElement
  renderOption: (props: ListChildComponentProps) => ReactElement
}

interface Language {
  code: string
  name: string
}

export function SiteLanguageSelect({
  onChange,
  dropdownRef,
  renderInput,
  renderOption
}: SiteLanguageSelectProps): ReactElement {
  const { i18n, t } = useTranslation()
  const [languages, setLanguages] = useState<Language[]>([])
  const [currentValue, setCurrentValue] = useState(i18n?.language ?? 'en')

  useEffect(() => {
    const currentLanguageCode = i18n?.language ?? 'en'
    const formattedLanguages = SUPPORTED_LOCALES.map(
      (languageCode): Language => {
        const nativeName = new Intl.DisplayNames([currentLanguageCode], {
          type: 'language'
        }).of(languageCode)
        const localName = new Intl.DisplayNames([languageCode], {
          type: 'language'
        }).of(languageCode)

        return {
          code: languageCode,
          name: localName ?? nativeName ?? languageCode
        }
      }
    )
    setLanguages(formattedLanguages)
  }, [i18n?.language])

  const handleLanguageChange = (languageCode: string): void => {
    setCurrentValue(languageCode)
    onChange(languageCode)
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
              id: currentValue,
              nativeName: languages.find((l) => l.code === currentValue)?.name,
              localName: languages.find((l) => l.code === currentValue)?.name
            }}
            onChange={(option) =>
              handleLanguageChange(option?.id || languages[0]?.code)
            }
            languages={languages.map((l) => ({
              id: l.code,
              name: [{ value: l.name, primary: true }],
              slug: null
            }))}
            disabled={false}
            renderInput={renderInput}
            renderOption={renderOption}
          />
        </div>
      </div>
    </div>
  )
}
