import { useTranslation } from 'next-i18next'
import { ReactElement, Ref, useEffect, useState } from 'react'

import Type3 from '@core/shared/ui/icons/Type3'
import {
  LanguageAutocomplete,
  LanguageOption
} from '@core/shared/ui/LanguageAutocomplete'

import { GetAllLanguages_languages as Language } from '../../../../__generated__/GetAllLanguages'
import { SUBTITLE_LANGUAGE_IDS } from '../../../config/subtitleLanguageIds'
import { renderInput } from '../utils/renderInput'
import { renderOption } from '../utils/renderOption'

interface SubtitlesSelectProps {
  languagesData?: Language[]
  loading: boolean
  selectedSubtitleId: string
  onChange: (selectedSubtitleId: string) => void
  subtitlesOn: boolean
  setSubtitlesOn: (value: boolean) => void
  dropdownRef: Ref<HTMLDivElement>
}

export function SubtitlesSelect({
  languagesData,
  loading,
  selectedSubtitleId,
  onChange,
  subtitlesOn,
  setSubtitlesOn,
  dropdownRef
}: SubtitlesSelectProps): ReactElement {
  const { t } = useTranslation()

  const selectedSubtitle = languagesData?.find(
    (language) => language.id === selectedSubtitleId
  )

  const [currentSubtitle, setCurrentSubtitle] = useState<
    LanguageOption | undefined
  >(undefined)

  useEffect(() => {
    if (selectedSubtitle != null && !loading) {
      setCurrentSubtitle({
        id: selectedSubtitle.id,
        localName: selectedSubtitle.name.find(({ primary }) => primary)?.value,
        nativeName: selectedSubtitle.name.find(({ primary }) => !primary)
          ?.value,
        slug: selectedSubtitle.slug
      })
    }
  }, [selectedSubtitle, loading])

  const allLanguageSubtitles = languagesData
    ?.filter((language) => SUBTITLE_LANGUAGE_IDS.includes(language.id))
    .map((language) => ({
      id: language.id,
      name: language.name,
      slug: language.slug
    }))

  function handleChange(language: LanguageOption): void {
    setCurrentSubtitle(language)
    onChange(language.id)
  }

  return (
    <div className="mt-6 mx-6">
      <div className="flex items-center justify-between">
        <label
          htmlFor="subtitles-select"
          className="block text-sm font-medium text-gray-700 ml-7"
        >
          {t('Subtitles')}
        </label>
      </div>
      <div className="relative mt-1 flex items-center gap-2" ref={dropdownRef}>
        <Type3 fontSize="small" />
        <div className="relative w-full">
          <LanguageAutocomplete
            value={{
              id: currentSubtitle?.id ?? '',
              nativeName: currentSubtitle?.nativeName,
              localName: currentSubtitle?.localName,
              slug: currentSubtitle?.slug
            }}
            onChange={handleChange}
            languages={allLanguageSubtitles}
            loading={loading}
            renderInput={renderInput(t('2000 translations'))}
            renderOption={renderOption}
          />
        </div>
      </div>
      <div className="flex ml-8 my-4 items-center gap-2">
        <input
          id="no-subtitles"
          type="checkbox"
          checked={subtitlesOn}
          onChange={() => setSubtitlesOn(!subtitlesOn)}
          className="accent-[#CB333B] h-4 w-4 rounded border-gray-300 focus:ring-0"
        />
        <label htmlFor="no-subtitles" className="text-sm text-gray-500">
          {t('Show subtitles')}
        </label>
      </div>
    </div>
  )
}
