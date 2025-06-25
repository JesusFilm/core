import { useLazyQuery } from '@apollo/client'
import ClosedCaptionOffOutlinedIcon from '@mui/icons-material/ClosedCaptionOffOutlined'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect } from 'react'

import {
  LanguageAutocomplete,
  LanguageOption
} from '@core/shared/ui/LanguageAutocomplete'

import { GetSubtitles } from '../../../../__generated__/GetSubtitles'
import { SUBTITLE_LANGUAGE_IDS } from '../../../config/subtitleLanguageIds'
import {
  useLanguageActions,
  useLanguagePreference
} from '../../../libs/languagePreferenceContext'
import { GET_SUBTITLES } from '../../SubtitleDialog/SubtitleDialog'
import { renderInput } from '../utils/renderInput'
import { renderOption } from '../utils/renderOption'

export function SubtitlesSelect(): ReactElement {
  const { t } = useTranslation()
  const {
    state: {
      allLanguages,
      subtitleLanguage,
      subtitleOn,
      currentSubtitleOn,
      videoId,
      videoSubtitleLanguages,
      videoVariantSlug,
      loading
    },
    dispatch
  } = useLanguagePreference()
  const { updateSubtitleLanguage, updateSubtitlesOn } = useLanguageActions()

  const [getSubtitleLanguages, { loading: subtitlesLoading }] =
    useLazyQuery<GetSubtitles>(GET_SUBTITLES, {
      onCompleted: (data) => {
        if (data?.video?.variant?.subtitle) {
          // This action doesn't have side effects, so we can use dispatch directly
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

  const preferredSubtitleOn = currentSubtitleOn ?? subtitleOn

  // Compute current subtitle display object directly from context
  const currentSubtitle =
    subtitleLanguage && allLanguages
      ? (() => {
          const selectedLanguage = allLanguages.find(
            (lang) => lang.id === subtitleLanguage
          )
          return selectedLanguage
            ? {
                id: selectedLanguage.id,
                localName: selectedLanguage.name.find(({ primary }) => primary)
                  ?.value,
                nativeName: selectedLanguage.name.find(
                  ({ primary }) => !primary
                )?.value,
                slug: selectedLanguage.slug
              }
            : undefined
        })()
      : undefined

  const allLanguageSubtitles = allLanguages
    ?.filter((language) => SUBTITLE_LANGUAGE_IDS.includes(language.id))
    .map((language) => ({
      id: language.id,
      name: language.name,
      slug: language.slug
    }))

  function handleChange(language: LanguageOption): void {
    updateSubtitleLanguage(language.id)
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
      <div className="relative mt-1 flex items-start gap-2">
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
            disabled={loading || subtitlesLoading}
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
          onChange={() => updateSubtitlesOn(!preferredSubtitleOn)}
          disabled={loading || subtitlesLoading}
          className="accent-[#CB333B] h-4 w-4 rounded border-gray-300 focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <label htmlFor="no-subtitles" className="text-sm text-gray-500">
          {t('Show subtitles')}
        </label>
      </div>
    </div>
  )
}
