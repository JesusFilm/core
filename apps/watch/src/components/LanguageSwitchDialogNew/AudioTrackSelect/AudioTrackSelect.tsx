import { useLazyQuery } from '@apollo/client'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, Ref, useEffect, useState } from 'react'

import MediaStrip1 from '@core/shared/ui/icons/MediaStrip1'
import {
  LanguageAutocomplete,
  LanguageOption
} from '@core/shared/ui/LanguageAutocomplete'

import { GetAllLanguages_languages as Language } from '../../../../__generated__/GetAllLanguages'
import { GetLanguagesSlug } from '../../../../__generated__/GetLanguagesSlug'
import { useLanguagePreference } from '../../../libs/languagePreferenceContext'
import { GET_LANGUAGES_SLUG } from '../../AudioLanguageDialog/AudioLanguageDialog'
import {
  selectLanguageForNoVideo,
  selectLanguageForVideo
} from '../utils/audioLanguageSetter'
import { renderInput } from '../utils/renderInput'
import { renderOption } from '../utils/renderOption'

interface AudioTrackSelectProps {
  loading: boolean
  onChange: (selectedLanguageId: string) => void
  dropdownRef: Ref<HTMLDivElement>
  value?: string // The currently selected audio language ID
}

export function AudioTrackSelect({
  loading,
  onChange,
  dropdownRef,
  value
}: AudioTrackSelectProps): ReactElement {
  const {
    state: {
      allLanguages,
      currentAudioLanguage,
      audioLanguage,
      videoId,
      videoAudioLanguages
    },
    dispatch
  } = useLanguagePreference()

  const [getAudioLanguages, { loading: audioLanguagesLoading }] =
    useLazyQuery<GetLanguagesSlug>(GET_LANGUAGES_SLUG, {
      onCompleted: (data) => {
        if (data?.video?.variantLanguagesWithSlug) {
          dispatch({
            type: 'SetVideoAudioLanguages',
            videoAudioLanguages: data.video.variantLanguagesWithSlug.map(
              (variant) => variant.language
            )
          })
        }
      }
    })

  const { t } = useTranslation()
  const router = useRouter()
  const [helperText, setHelperText] = useState<string>(t('2000 translations'))

  // Fetch audio languages for current video when needed
  useEffect(() => {
    if (videoId != null && videoAudioLanguages == null) {
      void getAudioLanguages({
        variables: {
          id: videoId
        }
      })
    }
  }, [videoId, videoAudioLanguages, getAudioLanguages])

  const [currentLanguage, setCurrentLanguage] = useState<
    LanguageOption | undefined
  >(undefined)

  // Update currentLanguage when external value prop changes (for immediate visual feedback)
  useEffect(() => {
    if (value && allLanguages) {
      const selectedLanguage = allLanguages.find((lang) => lang.id === value)
      if (selectedLanguage) {
        setCurrentLanguage({
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
    // Only run automatic selection logic if no external value is provided
    if (value == null || allLanguages == null || loading) return

    const params = {
      currentAudioLanguage,
      allLanguages,
      audioLanguage,
      router,
      setCurrentLanguage,
      setHelperText,
      t
    }

    if (videoId == null) {
      selectLanguageForNoVideo(params)
    } else {
      if (videoAudioLanguages == null || audioLanguagesLoading) return
      selectLanguageForVideo(params)
    }
  }, [
    value,
    loading,
    allLanguages,
    audioLanguage,
    currentAudioLanguage,
    t,
    router,
    videoId,
    videoAudioLanguages,
    audioLanguagesLoading
  ])

  const languages =
    allLanguages?.map((language: Language) => ({
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
            languages={languages}
            loading={loading || audioLanguagesLoading}
            disabled={loading}
            renderInput={renderInput(helperText)}
            renderOption={renderOption}
          />
        </div>
      </div>
    </div>
  )
}
