import SpatialAudioOffOutlinedIcon from '@mui/icons-material/SpatialAudioOffOutlined'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useMemo } from 'react'
import { useInstantSearch } from 'react-instantsearch'

import { type Language, useLanguages } from '../../../libs/useLanguages'
import { useLanguageActions } from '../../../libs/watchContext'
import { createFilterOptions } from '@mui/material/Autocomplete'
import { filterOptions } from '../utils/filterOptions'

function useSafeInstantSearch() {
  try {
    return useInstantSearch()
  } catch {
    return undefined
  }
}

interface AudioTrackSelectProps {
  videoAudioLanguageIds?: string[]
  audioLanguageId?: string
}

export function AudioTrackSelect({
  videoAudioLanguageIds,
  audioLanguageId
}: AudioTrackSelectProps): ReactElement {
  const { t } = useTranslation()
  const { updateAudioLanguage } = useLanguageActions()
  const { languages, isLoading } = useLanguages()
  const instantSearch = useSafeInstantSearch()

  const selectedOption = useMemo(
    () => languages.find((language) => language.id === audioLanguageId) ?? null,
    [languages, audioLanguageId]
  )
  const options = useMemo(() => {
    if (videoAudioLanguageIds == null) return languages
    return [
      ...languages.filter((language) =>
        videoAudioLanguageIds.includes(language.id)
      ),
      ...languages.filter(
        (language) => !videoAudioLanguageIds.includes(language.id)
      )
    ]
  }, [languages, videoAudioLanguageIds])
  const helperText = useMemo(() => {
    if (isLoading) return t('Loading...')

    if (videoAudioLanguageIds == null)
      return t('{{value}} languages', { value: languages.length })

    const available = videoAudioLanguageIds.length
    if (
      selectedOption != null &&
      videoAudioLanguageIds.find((id) => id === selectedOption.id) == null
    ) {
      return t(
        'This video is not available in {{value}}. Available in {{available}} languages.',
        {
          available,
          value: selectedOption.displayName
        }
      )
    } else {
      return t('This video is available in {{available}} languages.', {
        available
      })
    }
  }, [isLoading, t, videoAudioLanguageIds, selectedOption])

  function handleChange(_, language: Language): void {
    let reload = instantSearch == null
    if (reload) {
      const found = videoAudioLanguageIds?.find((id) => id === language.id)
      reload = found != null
    }
    updateAudioLanguage(language, reload)

    const languageEnglishName = language.englishName?.value
    if (instantSearch != null && languageEnglishName != null)
      instantSearch.setIndexUiState((prev) => ({
        ...prev,
        refinementList: {
          ...prev.refinementList,
          languageEnglishName: [languageEnglishName]
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
        <span
          className="text-sm text-gray-400"
          data-testid="AudioTrackSelectNativeName"
        >
          {selectedOption?.nativeName?.value}
        </span>
      </div>
      <div className="relative mt-1 flex items-start gap-2">
        <div className="pt-4">
          <SpatialAudioOffOutlinedIcon fontSize="small" />
        </div>
        <div className="relative w-full">
          <Autocomplete
            disableClearable
            // this is a workaround to keep the autocomplete controlled
            value={selectedOption as Language | undefined}
            options={options}
            groupBy={
              videoAudioLanguageIds == null
                ? undefined
                : (option) =>
                    videoAudioLanguageIds.includes(option.id)
                      ? t('Available Languages')
                      : t('Other Languages')
            }
            filterOptions={filterOptions}
            onChange={handleChange}
            loading={isLoading}
            getOptionKey={(option) => option.id}
            getOptionLabel={(option) => option.displayName}
            renderOption={({ key, ...optionProps }, option) => {
              return (
                <Box
                  key={key}
                  component="li"
                  {...optionProps}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    justifyContent: 'space-between !important'
                  }}
                >
                  <Typography variant="body1">{option.displayName}</Typography>
                  {option.nativeName && (
                    <Typography variant="body2" color="text.secondary">
                      {option.nativeName.value}
                    </Typography>
                  )}
                </Box>
              )
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                hiddenLabel
                variant="filled"
                helperText={helperText}
              />
            )}
          />
        </div>
      </div>
    </div>
  )
}
