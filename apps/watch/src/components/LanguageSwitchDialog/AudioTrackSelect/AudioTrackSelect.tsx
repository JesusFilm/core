import SpatialAudioOffOutlinedIcon from '@mui/icons-material/SpatialAudioOffOutlined'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, memo, useMemo } from 'react'
import { useInstantSearch } from 'react-instantsearch'

import {
  LanguageAutocomplete,
  LanguageOption
} from '@core/shared/ui/LanguageAutocomplete'

import { GetAllLanguages_languages as Language } from '../../../../__generated__/GetAllLanguages'

import { useLanguageActions, useWatch } from '../../../libs/watchContext'
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
      videoAudioLanguagesIdsAndSlugs,
      loading
    },
    dispatch
  } = useWatch()
  const { updateAudioLanguage } = useLanguageActions()

  const { t } = useTranslation()
  const router = useRouter()
  const instantSearch = useSafeInstantSearch()

  const currentLanguage = getCurrentAudioLanguage({
    allLanguages,
    currentAudioLanguage,
    routerAsPath: router.asPath,
    audioLanguage
  })

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
    let reload = instantSearch == null
    if (reload) {
      const found = videoAudioLanguagesIdsAndSlugs?.find(
        ({ id }) => id === language.id
      )
      reload = found != null
    }
    updateAudioLanguage(language, reload)

    if (instantSearch != null && language.localName != null)
      instantSearch.setIndexUiState((prev) => ({
        ...prev,
        refinementList: {
          ...prev.refinementList,
          languageEnglishName: [language.localName ?? '']
        }
      }))
  }

  const helperText = useMemo(() => {
    if (videoId == null) return t('2000 translations')
    if (loading) return t('Loading...')

    const found = videoAudioLanguagesIdsAndSlugs?.find(
      ({ id }) => id === currentAudioLanguage?.id
    )

    return found == null
      ? t('Not available in {{value}}', {
          value: currentLanguage?.localName ?? currentLanguage?.nativeName ?? ''
        })
      : t('2000 translations')
  }, [
    videoId,
    loading,
    t,
    currentAudioLanguage,
    videoAudioLanguagesIdsAndSlugs,

    currentLanguage
  ])

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
            loading={loading}
            disabled={loading}
            renderInput={renderInput(helperText)}
            renderOption={renderOption}
          />
        </div>
      </div>
    </div>
  )
})
