import { useLazyQuery } from '@apollo/client'
import SpatialAudioOffOutlinedIcon from '@mui/icons-material/SpatialAudioOffOutlined'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

import {
  LanguageAutocomplete,
  LanguageOption
} from '@core/shared/ui/LanguageAutocomplete'

import { GetAllLanguages_languages as Language } from '../../../../__generated__/GetAllLanguages'
import { GetLanguagesSlug } from '../../../../__generated__/GetLanguagesSlug'
import { useLanguageActions, useWatch } from '../../../libs/watchContext'
import { GET_LANGUAGES_SLUG } from '../../AudioLanguageDialog/AudioLanguageDialog'
import { selectLanguageForVideo } from '../utils/audioLanguageSetter'
import { renderInput } from '../utils/renderInput'
import { renderOption } from '../utils/renderOption'

export function AudioTrackSelect(): ReactElement {
  const {
    state: {
      allLanguages,
      currentAudioLanguage,
      audioLanguage,
      videoId,
      videoAudioLanguages,
      loading
    },
    dispatch
  } = useWatch()
  const { updateAudioLanguage } = useLanguageActions()

  const [getAudioLanguages, { loading: audioLanguagesLoading }] =
    useLazyQuery<GetLanguagesSlug>(GET_LANGUAGES_SLUG, {
      onCompleted: (data) => {
        if (data?.video?.variantLanguagesWithSlug) {
          // This action doesn't have side effects, so we can use dispatch directly
          dispatch({
            type: 'SetVideoAudioLanguages',
            videoAudioLanguages: data.video.variantLanguagesWithSlug
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

  // Compute current language display object with priority logic:
  // 1. Use currentAudioLanguage if available
  // 2. If undefined, use slug from path
  // 3. If that's null, fallback to audioLanguage
  const currentLanguage = (() => {
    if (!allLanguages) return undefined

    // Priority 1: Use currentAudioLanguage if available
    if (currentAudioLanguage) {
      const selectedLanguage = allLanguages.find(
        (lang) => lang.id === currentAudioLanguage.language.id
      )
      return selectedLanguage
        ? {
            id: selectedLanguage.id,
            localName: selectedLanguage.name.find(({ primary }) => primary)
              ?.value,
            nativeName: selectedLanguage.name.find(({ primary }) => !primary)
              ?.value,
            slug: selectedLanguage.slug
          }
        : undefined
    }

    // Priority 2: Use slug from path
    const currentPath = router.asPath
    const currentLanguageSlug = currentPath
      .split('/')
      .pop()
      ?.replace('.html', '')
    if (currentLanguageSlug) {
      const selectedLanguage = allLanguages.find(
        (lang) => lang.slug === currentLanguageSlug
      )
      if (selectedLanguage) {
        return {
          id: selectedLanguage.id,
          localName: selectedLanguage.name.find(({ primary }) => primary)
            ?.value,
          nativeName: selectedLanguage.name.find(({ primary }) => !primary)
            ?.value,
          slug: selectedLanguage.slug
        }
      }
    }

    // Priority 3: Fallback to audioLanguage
    if (audioLanguage) {
      const selectedLanguage = allLanguages.find(
        (lang) => lang.id === audioLanguage
      )
      return selectedLanguage
        ? {
            id: selectedLanguage.id,
            localName: selectedLanguage.name.find(({ primary }) => primary)
              ?.value,
            nativeName: selectedLanguage.name.find(({ primary }) => !primary)
              ?.value,
            slug: selectedLanguage.slug
          }
        : undefined
    }

    return undefined
  })()

  // console.log(currentLanguage)

  useEffect(() => {
    // Run automatic selection logic based on current state
    if (allLanguages == null || loading) return

    const params = {
      currentAudioLanguage,
      allLanguages,
      audioLanguage,
      router,
      setHelperText,
      t
    }

    if (videoId != null) {
      if (videoAudioLanguages == null || audioLanguagesLoading) return
      selectLanguageForVideo(params)
    }
  }, [
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
    updateAudioLanguage(language.id)
  }

  return (
    <div className="mb-4 mx-6">
      <div className="flex items-center justify-between">
        <label
          htmlFor="audio-select"
          className="block text-xl font-medium text-gray-700 ml-7"
        >
          {t('Audio Track')}
        </label>
        <span className="text-sm text-gray-400 opacity-60">
          {currentLanguage?.nativeName}
        </span>
      </div>
      <div className="relative mt-1 flex items-start gap-2">
        <div className="pt-4">
          <SpatialAudioOffOutlinedIcon fontSize="small" />
        </div>
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
