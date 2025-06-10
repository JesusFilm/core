import { AutocompleteRenderInputParams } from '@mui/material/Autocomplete'
import { ReactElement, Ref } from 'react'
import { ListChildComponentProps } from 'react-window'

import Globe from '@core/shared/ui/icons/Globe'
import { LanguageAutocomplete } from '@core/shared/ui/LanguageAutocomplete'

interface SiteLanguageSelectProps {
  value: string
  onChange: (value: string) => void
  languages: { code: string; name: string }[]
  t: (s: string) => string
  dropdownRef: Ref<HTMLDivElement>
  renderInput: (params: AutocompleteRenderInputParams) => ReactElement
  renderOption: (props: ListChildComponentProps) => ReactElement
}

export function SiteLanguageSelect({
  value,
  onChange,
  languages,
  t,
  dropdownRef,
  renderInput,
  renderOption
}: SiteLanguageSelectProps): ReactElement {
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
              id: value,
              nativeName: languages.find((l) => l.code === value)?.name,
              localName: languages.find((l) => l.code === value)?.name
            }}
            onChange={(option) => onChange(option?.id || languages[0].code)}
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
