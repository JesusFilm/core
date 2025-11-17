import { useTranslation } from 'next-i18next'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRefinementList } from 'react-instantsearch'

import { languageRefinementProps } from '@core/journeys/ui/algolia/SearchBarProvider'

import { useLanguages } from '../../libs/useLanguages'
import {
  LanguageFilterDropdown,
  type LanguageFilterOption
} from '../LanguageFilterDropdown'

// Single-select language filter component
export function LanguageSelector(): JSX.Element {
  const { t } = useTranslation('apps-watch')
  const { items, refine } = useRefinementList(languageRefinementProps)
  const { languages, isLoading: languagesLoading } = useLanguages()
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const lastSelectedRef = useRef<string[]>([])

  // Combine Algolia refinement data with full language information
  const languageOptions = useMemo<LanguageFilterOption[]>(() => {
    if (languagesLoading || languages.length === 0) return []

    const languageMap = new Map(
      languages.map((lang) => [lang.englishName?.value, lang])
    )

    const options = items.map((item) => {
      const languageData = languageMap.get(item.label)
      return {
        value: item.value,
        englishName: item.label,
        nativeName: languageData?.nativeName?.value || item.label
      }
    })

    return options.sort((a, b) => a.englishName.localeCompare(b.englishName))
  }, [items, languages, languagesLoading])

  // Update selected languages when refinements change, but persist when no results
  useEffect(() => {
    const refinedItems = items.filter((item) => item.isRefined)
    const currentSelectedValues = refinedItems.map((item) => item.value)

    if (currentSelectedValues.length > 0) {
      lastSelectedRef.current = currentSelectedValues
    }

    setSelectedLanguages(
      currentSelectedValues.length > 0
        ? currentSelectedValues
        : lastSelectedRef.current
    )
  }, [items])

  const handleLanguageSelect = (currentValue: string) => {
    items.forEach((item) => {
      if (item.isRefined && item.value !== currentValue) {
        refine(item.value)
      }
    })

    const currentItem = items.find((item) => item.value === currentValue)
    if (currentItem == null || !currentItem.isRefined) {
      refine(currentValue)
    }
  }

  return (
    <LanguageFilterDropdown
      options={languageOptions}
      loading={languagesLoading}
      selectedValue={selectedLanguages[0]}
      placeholder={t('Search languages...')}
      emptyLabel={t('No languages found.')}
      loadingLabel={t('Loading languages...')}
      onSelect={handleLanguageSelect}
    />
  )
}
