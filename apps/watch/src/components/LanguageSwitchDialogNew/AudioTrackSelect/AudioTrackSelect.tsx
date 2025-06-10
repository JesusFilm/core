import { AutocompleteRenderInputParams } from '@mui/material/Autocomplete'
import { ReactElement, Ref } from 'react'
import { ListChildComponentProps } from 'react-window'

import MediaStrip1 from '@core/shared/ui/icons/MediaStrip1'
import { LanguageAutocomplete } from '@core/shared/ui/LanguageAutocomplete'

interface AudioTrackSelectProps {
  value: string
  onChange: (value: string) => void
  languages: { code: string; name: string }[]
  t: (s: string) => string
  dropdownRef: Ref<HTMLDivElement>
  currentTrackName: string
  renderInput: (params: AutocompleteRenderInputParams) => ReactElement
  renderOption: (props: ListChildComponentProps) => ReactElement
}

export function AudioTrackSelect({
  value,
  onChange,
  languages,
  t,
  dropdownRef,
  currentTrackName,
  renderInput,
  renderOption
}: AudioTrackSelectProps): ReactElement {
  return (
    <div className="mb-4 mx-6">
      <div className="flex items-center justify-between">
        <label
          htmlFor="audio-select"
          className="block text-sm font-medium text-gray-700 ml-7"
        >
          {t('Audio Track')}
        </label>
        <span className="text-sm text-gray-400 opacity-60">
          {currentTrackName}
        </span>
      </div>
      <div className="relative mt-1 flex items-center gap-2" ref={dropdownRef}>
        <MediaStrip1 fontSize="small" />
        <div className="relative w-full">
          <LanguageAutocomplete
            value={{
              id: value,
              nativeName: languages.find((a) => a.code === value)?.name,
              localName: languages.find((a) => a.code === value)?.name
            }}
            onChange={(option) => onChange(option?.id || languages[0].code)}
            languages={languages.map((a) => ({
              id: a.code,
              name: [{ value: a.name, primary: true }],
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
