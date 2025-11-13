import { Captions } from 'lucide-react'
import { useTranslation } from 'next-i18next'
import { ChangeEvent, ReactElement, useId, useMemo } from 'react'

import { SUBTITLE_LANGUAGE_IDS } from '../../../libs/localeMapping'
import { Language, useLanguages } from '../../../libs/useLanguages'
import { useLanguageActions } from '../../../libs/watchContext'
import { LanguageCommandSelect } from '../LanguageCommandSelect'

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
  const { t } = useTranslation('apps-watch')
  const { updateSubtitleLanguage, updateSubtitlesOn } = useLanguageActions()
  const { languages: allLanguages, isLoading } = useLanguages()
  const comboboxId = useId()
  const helperTextId = `${comboboxId}-helper`
  const languages = useMemo(() => {
    return allLanguages.filter((language) =>
      SUBTITLE_LANGUAGE_IDS.includes(language.id)
    )
  }, [allLanguages])

  const selectedOption = useMemo(
    () =>
      languages.find((language) => language.id === subtitleLanguageId) ?? null,
    [languages, subtitleLanguageId]
  )
  const options = useMemo(() => {
    if (videoSubtitleLanguageIds == null) return languages
    return languages.filter((language) =>
      videoSubtitleLanguageIds.includes(language.id)
    )
  }, [languages, videoSubtitleLanguageIds])
  const helperText = useMemo(() => {
    if (isLoading) return t('Loading...')

    if (videoSubtitleLanguageIds == null)
      return t('Available in {{count}} languages.', { count: languages.length })

    const available = videoSubtitleLanguageIds.length
    if (
      selectedOption != null &&
      videoSubtitleLanguageIds.find((id) => id === selectedOption.id) == null
    ) {
      return [
        t('Subtitles are not available in {{language}}.', {
          language: selectedOption.displayName
        }),
        t('Available in {{count}} languages.', {
          count: available
        })
      ].join(' ')
    } else {
      return t('Available in {{count}} languages.', {
        count: available
      })
    }
  }, [isLoading, t, videoSubtitleLanguageIds, selectedOption])

  function handleSubtitleLanguageChange(language: Language): void {
    updateSubtitleLanguage(language)
  }
  function handleSubtitlesOnChange(event: ChangeEvent<HTMLInputElement>): void {
    updateSubtitlesOn(event.target.checked)
  }

  return (
    <div className="mx-6 font-sans">
      <div className="flex items-center justify-between">
        <label
          htmlFor={comboboxId}
          className="ml-7 block text-xl font-medium text-gray-200"
        >
          {t('Subtitles')}
        </label>
        {selectedOption?.nativeName &&
          selectedOption?.nativeName.value !== selectedOption?.displayName && (
            <span
              className="text-sm text-gray-400"
              data-testid="SubtitlesSelectNativeName"
            >
              {selectedOption?.nativeName.value}
            </span>
          )}
      </div>
      <div className="relative mt-2">
        <LanguageCommandSelect
          options={options}
          selectedOption={selectedOption}
          placeholder={t('Search languages...')}
          emptyMessage={t('No languages found.')}
          loadingMessage={t('Loading languages...')}
          helperText={helperText}
          onSelect={handleSubtitleLanguageChange}
          icon={<Captions className="h-5 w-5 text-stone-400" />}
          disabled={isLoading}
          id={comboboxId}
          ariaDescribedBy={helperText != null ? helperTextId : undefined}
        />
      </div>
      <div className="my-4 ml-8 flex items-center gap-2">
        <input
          id="no-subtitles"
          type="checkbox"
          checked={subtitleOn}
          onChange={handleSubtitlesOnChange}
          className="h-4 w-4 rounded border-gray-300 accent-[#CB333B] focus:ring-0"
        />
        <label htmlFor="no-subtitles" className="text-sm text-gray-500">
          {t('Show subtitles')}
        </label>
      </div>
    </div>
  )
}
