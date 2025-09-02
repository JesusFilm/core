import ClosedCaptionOffOutlinedIcon from '@mui/icons-material/ClosedCaptionOffOutlined'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ChangeEvent, ReactElement, useMemo } from 'react'

import { SUBTITLE_LANGUAGE_IDS } from '../../../libs/localeMapping'
import { Language, useLanguages } from '../../../libs/useLanguages'
import { useLanguageActions } from '../../../libs/watchContext'

interface SubtitlesSelectProps {
  videoSubtitleLanguageIds?: string[]
  subtitleLanguageId?: string
  subtitleOn?: boolean
}

export function SubtitlesSelect({
  videoSubtitleLanguageIds,
  subtitleLanguageId,
  subtitleOn
}: SubtitlesSelectProps): ReactElement {
  const { t } = useTranslation()
  const { updateSubtitleLanguage, updateSubtitlesOn } = useLanguageActions()
  const { languages, isLoading } = useLanguages()

  const selectedOption = useMemo(
    () =>
      languages.find((language) => language.id === subtitleLanguageId) ?? null,
    [languages, subtitleLanguageId]
  )
  const options = useMemo(() => {
    if (videoSubtitleLanguageIds == null) return languages
    return [
      ...languages.filter((language) =>
        videoSubtitleLanguageIds.includes(language.id)
      ),
      ...languages.filter(
        (language) =>
          !videoSubtitleLanguageIds.includes(language.id) &&
          SUBTITLE_LANGUAGE_IDS.includes(language.id)
      )
    ]
  }, [languages, videoSubtitleLanguageIds])
  const helperText = useMemo(() => {
    if (isLoading) return t('Loading...')

    if (videoSubtitleLanguageIds == null)
      return t('{{value}} languages', { value: languages.length })

    const available = videoSubtitleLanguageIds.length
    if (
      selectedOption != null &&
      videoSubtitleLanguageIds.find((id) => id === selectedOption.id) == null
    ) {
      return t(
        'Subtitles are not available in {{value}}. Available in {{available}} languages.',
        {
          available,
          value: selectedOption.displayName
        }
      )
    } else {
      return t('Subtitles are available in {{available}} languages.', {
        available
      })
    }
  }, [isLoading, t, videoSubtitleLanguageIds, selectedOption])

  function handleSubtitleLanguageChange(_, language: Language): void {
    updateSubtitleLanguage(language)
  }
  function handleSubtitlesOnChange(event: ChangeEvent<HTMLInputElement>): void {
    updateSubtitlesOn(event.target.checked)
  }

  return (
    <div className="mx-6 font-sans">
      <div className="flex items-center justify-between">
        <label
          htmlFor="subtitles-select"
          className="block text-xl font-medium text-gray-700 ml-7"
        >
          {t('Subtitles')}
        </label>
        <span
          className="text-sm text-gray-400"
          data-testid="SubtitlesSelectNativeName"
        >
          {selectedOption?.nativeName?.value}
        </span>
      </div>
      <div className="relative mt-1 flex items-start gap-2">
        <div className="pt-4">
          <ClosedCaptionOffOutlinedIcon fontSize="small" />
        </div>
        <div className="relative w-full">
          <Autocomplete
            disableClearable
            // this is a workaround to keep the autocomplete controlled
            value={selectedOption as Language | undefined}
            options={options}
            groupBy={
              videoSubtitleLanguageIds == null
                ? undefined
                : (option) =>
                    videoSubtitleLanguageIds.includes(option.id)
                      ? t('Available Languages')
                      : t('Other Languages')
            }
            onChange={handleSubtitleLanguageChange}
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
      <div className="flex ml-8 my-4 items-center gap-2">
        <input
          id="no-subtitles"
          type="checkbox"
          checked={subtitleOn}
          onChange={handleSubtitlesOnChange}
          className="accent-[#CB333B] h-4 w-4 rounded border-gray-300 focus:ring-0"
        />
        <label htmlFor="no-subtitles" className="text-sm text-gray-500">
          {t('Show subtitles')}
        </label>
      </div>
    </div>
  )
}
