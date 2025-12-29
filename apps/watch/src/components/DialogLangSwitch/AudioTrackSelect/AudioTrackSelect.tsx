import { Languages } from 'lucide-react'
import { useTranslation } from 'next-i18next'
import { ReactElement, useId, useMemo } from 'react'

import { type Language, useLanguages } from '../../../libs/useLanguages'
import { LanguageCommandSelect } from '../LanguageCommandSelect'

interface AudioTrackSelectProps {
  videoAudioLanguageIds?: string[]
  audioLanguageId?: string
  onLanguageChange?: (language: Language) => void
}

export function AudioTrackSelect({
  videoAudioLanguageIds,
  audioLanguageId,
  onLanguageChange
}: AudioTrackSelectProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const { languages, isLoading } = useLanguages()
  const comboboxId = useId()

  const selectedOption = useMemo(
    () => languages.find((language) => language.id === audioLanguageId) ?? null,
    [languages, audioLanguageId]
  )
  const options = useMemo(() => {
    if (videoAudioLanguageIds == null) return languages
    return languages.filter((language) =>
      videoAudioLanguageIds.includes(language.id)
    )
  }, [languages, videoAudioLanguageIds])

  const languageCount = useMemo(() => {
    if (isLoading) return 0
    return videoAudioLanguageIds == null
      ? languages.length
      : videoAudioLanguageIds.length
  }, [isLoading, videoAudioLanguageIds, languages.length])

  function handleSelect(language: Language): void {
    onLanguageChange?.(language)
  }

  return (
    <div className="mx-6 font-sans">
      <div className="flex items-center justify-between">
        <label
          htmlFor={comboboxId}
          className="block text-xl font-medium text-gray-200"
        >
          <span className="flex items-center gap-2">{t('Language')}</span>
        </label>
        {!isLoading && languageCount > 0 && (
          <span
            className="text-sm text-stone-400"
            data-testid="AudioTrackSelectLanguageCount"
          >
            {t('{{count}} languages', { count: languageCount })}
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
          noLanguagesMessage={t('Not available')}
          onSelect={handleSelect}
          icon={<Languages className="h-5 w-5 text-stone-400" />}
          disabled={isLoading || languageCount === 0}
          isLoading={isLoading}
          id={comboboxId}
        />
      </div>
    </div>
  )
}
