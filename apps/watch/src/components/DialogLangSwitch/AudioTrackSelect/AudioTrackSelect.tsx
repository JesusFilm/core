import { Languages } from 'lucide-react'
import { useTranslation } from 'next-i18next'
import { ReactElement, useId, useMemo } from 'react'
import { useInstantSearch } from 'react-instantsearch'

import { LANGUAGE_MAPPINGS } from '../../../libs/localeMapping'
import { type Language, useLanguages } from '../../../libs/useLanguages'
import { useLanguageActions } from '../../../libs/watchContext'
import { LanguageCommandSelect } from '../LanguageCommandSelect'

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
  const { t, i18n } = useTranslation('apps-watch')
  const { updateAudioLanguage } = useLanguageActions()
  const { languages, isLoading } = useLanguages()
  const instantSearch = useSafeInstantSearch()
  const comboboxId = useId()
  const helperTextId = `${comboboxId}-helper`

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
  const helperText = useMemo(() => {
    if (isLoading) return t('Loading...')

    if (videoAudioLanguageIds == null)
      return t('Available in {{count}} languages.', { count: languages.length })

    const available = videoAudioLanguageIds.length
    if (
      selectedOption != null &&
      videoAudioLanguageIds.find((id) => id === selectedOption.id) == null
    ) {
      return [
        t('This content is not available in {{language}}.', {
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
  }, [isLoading, t, videoAudioLanguageIds, selectedOption])

  function handleSelect(language: Language): void {
    let reload = instantSearch == null
    if (reload) {
      const found = videoAudioLanguageIds?.find((id) => id === language.id)
      reload = found != null
    }
    updateAudioLanguage(language, reload)
    const languageLocale = Object.values(LANGUAGE_MAPPINGS).find(
      (mapping) => mapping.languageId === language.id
    )?.locale
    if (languageLocale != null) {
      void i18n.changeLanguage(languageLocale)
    }

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
          htmlFor={comboboxId}
          className="ml-7 block text-xl font-medium text-gray-200"
        >
          {t('Language')}
        </label>
        {selectedOption?.nativeName &&
          selectedOption?.nativeName.value !== selectedOption?.displayName && (
            <span
              className="text-sm text-gray-400"
              data-testid="AudioTrackSelectNativeName"
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
          onSelect={handleSelect}
          icon={<Languages className="h-5 w-5 text-stone-400" />}
          disabled={isLoading}
          id={comboboxId}
          ariaDescribedBy={helperText != null ? helperTextId : undefined}
        />
      </div>
    </div>
  )
}
