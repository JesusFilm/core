import { useLazyQuery } from '@apollo/client'
import SpatialAudioOffOutlinedIcon from '@mui/icons-material/SpatialAudioOffOutlined'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, memo, useEffect, useMemo, useState } from 'react'
import { useInstantSearch } from 'react-instantsearch'

import {
  LanguageAutocomplete,
  LanguageOption
} from '@core/shared/ui/LanguageAutocomplete'

import { GetAllLanguages_languages as Language } from '../../../../__generated__/GetAllLanguages'
import { GetLanguagesSlug } from '../../../../__generated__/GetLanguagesSlug'
import { useLanguageActions, useWatch } from '../../../libs/watchContext'
import { GET_LANGUAGES_SLUG } from '../../../libs/useLanguagesSlugQuery'
import { selectLanguageForVideo } from '../utils/audioLanguageSetter'
import { getCurrentAudioLanguage } from '../utils/getCurrentAudioLanguage'
import { renderInput } from '../utils/renderInput'
import { renderOption } from '../utils/renderOption'

function useSafeInstantSearch() {
  try {
    return useInstantSearch()
  } catch {
    return undefined
  }
}

export const AudioTrackSelect = memo(function AudioTrackSelect(): ReactElement {
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
  const instantSearch = useSafeInstantSearch()

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

  const currentLanguage = getCurrentAudioLanguage({
    allLanguages,
    currentAudioLanguage,
    routerAsPath: router.asPath,
    audioLanguage
  })

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

  const languages = useMemo(
    () =>
      allLanguages?.map((language: Language) => ({
        id: language.id,
        name: language.name,
        slug: language.slug
      })) ?? [],
    [allLanguages]
  )

  function handleChange(language: LanguageOption): void {
    updateAudioLanguage(language.id, instantSearch == null)

    if (instantSearch != null && language.localName != null)
      instantSearch.setIndexUiState((prev) => ({
        ...prev,
        refinementList: {
          ...prev.refinementList,
          languageEnglishName: [language.localName ?? '']
        }
      }))
  }

  return (
    <div className="mx-6 font-sans">
      <div className="flex items-center justify-between">
        <label
          htmlFor="audio-select"
          className="block text-xl font-medium text-gray-700 ml-7"
        >
          {t('Language')}
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
})
