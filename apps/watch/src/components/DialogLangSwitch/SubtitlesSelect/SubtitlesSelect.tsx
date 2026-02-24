import { Captions } from 'lucide-react'
import { useTranslation } from 'next-i18next'
import { ReactElement, useId, useMemo } from 'react'

import { Switch } from '@core/shared/ui-modern/components'
import { cn } from '@core/shared/ui-modern/utils'

import { SUBTITLE_LANGUAGE_IDS } from '../../../libs/localeMapping'
import { Language, useLanguages } from '../../../libs/useLanguages'
import { LanguageCommandSelect } from '../LanguageCommandSelect'

interface SubtitlesSelectProps {
  videoSubtitleLanguageIds?: string[]
  subtitleLanguageId?: string
  subtitleOn?: boolean
  onLanguageChange?: (languageId: string) => void
  onSubtitleToggleChange?: (subtitleOn: boolean) => void
}

export function SubtitlesSelect({
  videoSubtitleLanguageIds,
  subtitleLanguageId,
  subtitleOn,
  onLanguageChange,
  onSubtitleToggleChange
}: SubtitlesSelectProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const { languages: allLanguages, isLoading } = useLanguages()
  const comboboxId = useId()
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

  const subtitleCount = useMemo(() => {
    if (isLoading) return 0
    return videoSubtitleLanguageIds == null
      ? languages.length
      : videoSubtitleLanguageIds.length
  }, [isLoading, videoSubtitleLanguageIds, languages.length])

  function handleSubtitleLanguageChange(language: Language): void {
    onLanguageChange?.(language.id)
  }
  function handleSubtitlesOnChange(checked: boolean): void {
    onSubtitleToggleChange?.(checked)
  }

  return (
    <div className="mx-6 font-sans">
      <div className="flex items-center justify-between">
        <label
          htmlFor={comboboxId}
          className={cn(
            'block text-xl text-stone-200',
            subtitleOn ? 'font-medium' : 'font-regular text-md'
          )}
        >
          <span className="flex items-center gap-2">
            {t('Subtitles')}
            <Switch
              id="show-subtitles"
              aria-label="Show subtitles"
              checked={subtitleOn}
              onCheckedChange={handleSubtitlesOnChange}
              disabled={subtitleCount === 0}
              className={cn(
                'ml-2 data-[state=checked]:bg-white data-[state=unchecked]:bg-stone-200/40',
                subtitleCount === 0 && 'cursor-not-allowed opacity-50'
              )}
            />
          </span>
        </label>
        {!isLoading && subtitleCount > 0 && (
          <span
            className="text-sm text-stone-400"
            data-testid="SubtitlesSelectLanguageCount"
          >
            {t('{{count}} languages', { count: subtitleCount })}
          </span>
        )}
      </div>
      {subtitleOn && (
        <div className="relative mt-2">
          <LanguageCommandSelect
            options={options}
            selectedOption={selectedOption}
            placeholder={t('Search languages...')}
            emptyMessage={t('No languages found.')}
            loadingMessage={t('Loading languages...')}
            noLanguagesMessage={t('Not available')}
            onSelect={handleSubtitleLanguageChange}
            icon={<Captions className="h-5 w-5 text-stone-400" />}
            disabled={isLoading || subtitleCount === 0}
            isLoading={isLoading}
            id={comboboxId}
          />
        </div>
      )}
    </div>
  )
}
