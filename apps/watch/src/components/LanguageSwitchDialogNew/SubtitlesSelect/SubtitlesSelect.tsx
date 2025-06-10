import { AutocompleteRenderInputParams } from '@mui/material/Autocomplete'
import { ReactElement, Ref } from 'react'
import { ListChildComponentProps } from 'react-window'

import Type3 from '@core/shared/ui/icons/Type3'
import { LanguageAutocomplete } from '@core/shared/ui/LanguageAutocomplete'

interface SubtitlesSelectProps {
  value: string
  onChange: (value: string) => void
  languages: { code: string; name: string }[]
  t: (s: string) => string
  dropdownRef: Ref<HTMLDivElement>
  noSubtitles: boolean
  setNoSubtitles: (value: boolean) => void
  disabled: boolean
  renderInput: (params: AutocompleteRenderInputParams) => ReactElement
  renderOption: (props: ListChildComponentProps) => ReactElement
}

export function SubtitlesSelect({
  value,
  onChange,
  languages,
  t,
  dropdownRef,
  noSubtitles,
  setNoSubtitles,
  disabled,
  renderInput,
  renderOption
}: SubtitlesSelectProps): ReactElement {
  return (
    <div className="mt-6 mx-6">
      <div className="flex items-center justify-between">
        <label
          htmlFor="subtitles-select"
          className="block text-sm font-medium text-gray-700 ml-7"
        >
          {t('Subtitles')}
        </label>
        <div className="flex items-center gap-2">
          <input
            id="no-subtitles"
            type="checkbox"
            checked={noSubtitles}
            onChange={() => setNoSubtitles(!noSubtitles)}
            className="accent-[#CB333B] h-4 w-4 rounded border-gray-300 focus:ring-0"
          />
          <label htmlFor="no-subtitles" className="text-sm text-gray-500">
            {t('None')}
          </label>
        </div>
      </div>
      <div className="relative mt-1 flex items-center gap-2" ref={dropdownRef}>
        <Type3 fontSize="small" />
        <div className="relative w-full">
          <LanguageAutocomplete
            value={{
              id: value,
              nativeName: languages.find((s) => s.code === value)?.name,
              localName: languages.find((s) => s.code === value)?.name
            }}
            onChange={(option) => onChange(option?.id || languages[0].code)}
            languages={languages.map((s) => ({
              id: s.code,
              name: [{ value: s.name, primary: true }],
              slug: null
            }))}
            disabled={disabled}
            renderInput={renderInput}
            renderOption={renderOption}
          />
        </div>
      </div>
    </div>
  )
}
