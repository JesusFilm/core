import { useTranslation } from 'next-i18next'
import { ReactElement, useMemo } from 'react'


import { AlgoliaVideoGrid } from '../VideoGrid/AlgoliaVideoGrid'

import { LanguageSelector } from './LanguageSelector'
import { QuickList } from './QuickList'

export interface SearchResultsLayoutProps {
  searchQuery: string
  onSelectQuickValue: (value: string) => void
  languageId?: string
}

export function generateRelatedSearches(query: string): string[] {
  if (!query || query.trim().length === 0) return []

  const baseQuery = query.trim().toLowerCase()
  const relatedSuggestions: string[] = []

  const relatedTerms = {
    faith: ['hope', 'trust', 'belief', 'prayer', 'worship'],
    hope: ['faith', 'trust', 'encouragement', 'inspiration', 'peace'],
    prayer: ['worship', 'meditation', 'faith', 'devotion', 'thanksgiving'],
    worship: ['praise', 'prayer', 'music', 'celebration', 'adoration'],
    bible: ['scripture', 'verse', 'study', 'devotion', 'teaching'],
    family: ['parenting', 'marriage', 'children', 'relationships', 'home'],
    marriage: ['family', 'relationships', 'love', 'commitment', 'couples'],
    children: ['family', 'parenting', 'youth', 'kids', 'education'],
    youth: ['teens', 'children', 'young adults', 'students', 'ministry'],
    christmas: ['holiday', 'celebration', 'nativity', 'advent', 'winter'],
    easter: ['resurrection', 'spring', 'celebration', 'new life', 'hope'],
    holiday: ['christmas', 'celebration', 'family', 'tradition', 'season'],
    teaching: ['education', 'learning', 'study', 'instruction', 'wisdom'],
    study: ['learning', 'bible', 'education', 'research', 'knowledge'],
    wisdom: ['teaching', 'knowledge', 'understanding', 'guidance', 'insight']
  }

  const directMatches =
    relatedTerms[baseQuery as keyof typeof relatedTerms] || []
  relatedSuggestions.push(...directMatches.slice(0, 3))

  Object.entries(relatedTerms).forEach(([key, values]) => {
    if (key.includes(baseQuery) || baseQuery.includes(key)) {
      relatedSuggestions.push(...values.slice(0, 2))
    }
  })

  const contextualSuggestions = [
    `${baseQuery} study`,
    `${baseQuery} sermon`,
    `${baseQuery} message`,
    `${baseQuery} story`,
    `${baseQuery} teaching`
  ]

  relatedSuggestions.push(...contextualSuggestions.slice(0, 2))

  const uniqueSuggestions = [...new Set(relatedSuggestions)]
    .filter((suggestion) => suggestion.toLowerCase() !== baseQuery)
    .slice(0, 6)

  return uniqueSuggestions
}

export function SearchResultsLayout({
  searchQuery,
  onSelectQuickValue,
  languageId
}: SearchResultsLayoutProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const relatedSearches = useMemo(
    () => generateRelatedSearches(searchQuery),
    [searchQuery]
  )

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        <div className="flex-1">
          <QuickList
            title={t('Related Searches')}
            items={relatedSearches}
            onSelect={onSelectQuickValue}
            isLoading={false}
          />
        </div>
        <div className="w-full md:w-80 flex-shrink-0">
          <div className="block mb-3 font-semibold text-xs uppercase tracking-wider text-gray-600">
            {t('Search Filters')}
          </div>
          <LanguageSelector />
        </div>
      </div>

      <AlgoliaVideoGrid
        variant="contained"
        languageId={languageId}
        showLoadMore
      />
    </div>
  )
}
