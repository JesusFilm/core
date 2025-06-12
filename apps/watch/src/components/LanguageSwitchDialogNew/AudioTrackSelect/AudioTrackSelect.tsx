import { gql, useQuery } from '@apollo/client'
import { AutocompleteRenderInputParams } from '@mui/material/Autocomplete'
import { useTranslation } from 'next-i18next'
import { ReactElement, Ref, useEffect, useState } from 'react'
import { ListChildComponentProps } from 'react-window'

import MediaStrip1 from '@core/shared/ui/icons/MediaStrip1'
import {
  LanguageAutocomplete,
  LanguageOption
} from '@core/shared/ui/LanguageAutocomplete'

import {
  GetAllLanguages,
  GetAllLanguages_languages as Language
} from '../../../../__generated__/GetAllLanguages'

const GET_ALL_LANGUAGES = gql`
  query GetAllLanguages {
    languages {
      id
      bcp47
      slug
      name {
        primary
        value
      }
    }
  }
`

interface AudioTrackSelectProps {
  selectedLanguageId: string
  onChange: (selectedLanguageId: string) => void
  dropdownRef: Ref<HTMLDivElement>
  renderInput: (params: AutocompleteRenderInputParams) => ReactElement
  renderOption: (props: ListChildComponentProps) => ReactElement
}

export function AudioTrackSelect({
  selectedLanguageId,
  onChange,
  dropdownRef,
  renderInput,
  renderOption
}: AudioTrackSelectProps): ReactElement {
  const { data, loading } = useQuery<GetAllLanguages>(GET_ALL_LANGUAGES)
  const { t } = useTranslation()

  const selectedLanguage = data?.languages?.find(
    (language) => language.id === selectedLanguageId
  )

  const [currentLanguage, setCurrentLanguage] = useState<
    LanguageOption | undefined
  >(undefined)

  useEffect(() => {
    if (selectedLanguage != null && !loading) {
      setCurrentLanguage({
        id: selectedLanguage.id,
        localName: selectedLanguage.name.find(({ primary }) => primary)?.value,
        nativeName: selectedLanguage.name.find(({ primary }) => !primary)
          ?.value,
        slug: selectedLanguage.slug
      })
    }
  }, [selectedLanguage, loading])

  const allLanguages =
    data?.languages?.map((language: Language) => ({
      id: language.id,
      name: language.name,
      slug: language.slug
    })) ?? []

  function handleChange(language: LanguageOption): void {
    setCurrentLanguage(language)
    onChange(language.id)
  }

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
          {currentLanguage?.nativeName}
        </span>
      </div>
      <div className="relative mt-1 flex items-center gap-2" ref={dropdownRef}>
        <MediaStrip1 fontSize="small" />
        <div className="relative w-full">
          <LanguageAutocomplete
            value={{
              id: currentLanguage?.id ?? '',
              localName: currentLanguage?.localName,
              nativeName: currentLanguage?.nativeName,
              slug: currentLanguage?.slug
            }}
            onChange={handleChange}
            languages={allLanguages}
            loading={loading}
            disabled={loading}
            renderInput={renderInput}
            renderOption={renderOption}
          />
        </div>
      </div>
    </div>
  )
}
