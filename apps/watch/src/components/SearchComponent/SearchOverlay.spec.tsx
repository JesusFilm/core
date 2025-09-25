import { render, screen } from '@testing-library/react'
import { createRef } from 'react'

import { SearchOverlay } from './SearchOverlay'

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))

jest.mock('./LanguageSelector', () => ({
  LanguageSelector: () => <div data-testid="LanguageSelector" />
}))

jest.mock('./CategoryGrid', () => ({
  CategoryGrid: ({ onCategorySelect }: { onCategorySelect: (value: string) => void }) => (
    <div data-testid="CategoryGrid" onClick={() => onCategorySelect('category')} />
  )
}))

jest.mock('./SearchResultsLayout', () => ({
  SearchResultsLayout: () => <div data-testid="SearchResultsLayout" />
}))

describe('SearchOverlay', () => {
  it('renders fallback trending content when trending data fails', () => {
    const onSelect = jest.fn()
    const containerRef = createRef<HTMLDivElement>()

    render(
      <SearchOverlay
        open
        hasQuery={false}
        searchQuery=""
        onBlur={jest.fn()}
        onSelectQuickValue={onSelect}
        containerRef={containerRef}
        languageId="en"
        onClose={jest.fn()}
        trendingSearches={['Hope', 'Faith']}
        isTrendingLoading={false}
        isTrendingFallback
      />
    )

    expect(screen.getByText('Popular Searches')).toBeInTheDocument()
    expect(screen.getByText('Hope')).toBeInTheDocument()
    expect(screen.getByText('Faith')).toBeInTheDocument()
  })
})
