import { useLazyQuery } from '@apollo/client'
import ClosedCaptionOffOutlinedIcon from '@mui/icons-material/ClosedCaptionOffOutlined'
import { useTranslation } from 'next-i18next'
import { ReactElement, Ref, useEffect, useState } from 'react'

import {
  LanguageAutocomplete,
  LanguageOption
} from '@core/shared/ui/LanguageAutocomplete'

import { GetSubtitles } from '../../../../__generated__/GetSubtitles'
import { SUBTITLE_LANGUAGE_IDS } from '../../../config/subtitleLanguageIds'
import { useLanguagePreference } from '../../../libs/languagePreferenceContext/LanguagePreferenceContext'
import { GET_SUBTITLES } from '../../SubtitleDialog/SubtitleDialog'
import { renderInput } from '../utils/renderInput'
import { renderOption } from '../utils/renderOption'

interface SubtitlesSelectProps {
  loading: boolean
  onChange: (selectedSubtitleId: string) => void
  setSubtitlesOn: (value: boolean) => void
  dropdownRef: Ref<HTMLDivElement>
  value?: string
}

export function SubtitlesSelect({
  loading,
  onChange,
  setSubtitlesOn,
  dropdownRef,
  value
}: SubtitlesSelectProps): ReactElement {
  const { t } = useTranslation()
  const {
    state: {
      allLanguages,
      subtitleLanguage,
      subtitleOn,
      currentSubtitleOn,
      videoId,
      videoSubtitleLanguages,
      videoVariantSlug
    },
    dispatch
  } = useLanguagePreference()

  const [getSubtitleLanguages, { loading: subtitlesLoading }] =
    useLazyQuery<GetSubtitles>(GET_SUBTITLES, {
      onCompleted: (data) => {
        if (data?.video?.variant?.subtitle) {
          dispatch({
            type: 'SetVideoSubtitleLanguages',
            videoSubtitleLanguages: data.video.variant.subtitle
          })
        }
      }
    })

  useEffect(() => {
    if (videoId != null && videoSubtitleLanguages == null) {
      void getSubtitleLanguages({
        variables: {
          id: videoVariantSlug
        }
      })
    }
  }, [videoId, videoSubtitleLanguages, getSubtitleLanguages])

  const selectedSubtitle = allLanguages?.find(
    (language) => language.id === subtitleLanguage
  )

  const preferredSubtitleOn = currentSubtitleOn ?? subtitleOn

  const [currentSubtitle, setCurrentSubtitle] = useState<
    LanguageOption | undefined
  >(undefined)

  // Update currentSubtitle when external value prop changes (for immediate visual feedback)
  useEffect(() => {
    if (value && allLanguages) {
      const selectedLanguage = allLanguages.find((lang) => lang.id === value)
      if (selectedLanguage) {
        setCurrentSubtitle({
          id: selectedLanguage.id,
          localName: selectedLanguage.name.find(({ primary }) => primary)
            ?.value,
          nativeName: selectedLanguage.name.find(({ primary }) => !primary)
            ?.value,
          slug: selectedLanguage.slug
        })
      }
    }
  }, [value, allLanguages])

  useEffect(() => {
    // Only use internal state if no external value is provided
    if (value || !selectedSubtitle || loading) return

    setCurrentSubtitle({
      id: selectedSubtitle.id,
      localName: selectedSubtitle.name.find(({ primary }) => primary)?.value,
      nativeName: selectedSubtitle.name.find(({ primary }) => !primary)?.value,
      slug: selectedSubtitle.slug
    })
  }, [value, selectedSubtitle, loading])

  const allLanguageSubtitles = allLanguages
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
      <div className="relative mt-1 flex items-start gap-2" ref={dropdownRef}>
        <div className="pt-4">
          <ClosedCaptionOffOutlinedIcon fontSize="small" />
        </div>
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
            loading={loading || subtitlesLoading}
            renderInput={renderInput(t('2000 translations'))}
            renderOption={renderOption}
          />
        </div>
      </div>
      <div className="flex ml-8 my-4 items-center gap-2">
        <input
          id="no-subtitles"
          type="checkbox"
          checked={preferredSubtitleOn}
          onChange={() => setSubtitlesOn(!preferredSubtitleOn)}
          className="accent-[#CB333B] h-4 w-4 rounded border-gray-300 focus:ring-0"
        />
        <label htmlFor="no-subtitles" className="text-sm text-gray-500">
          {t('Show subtitles')}
        </label>
      </div>
    </div>
  )
}
