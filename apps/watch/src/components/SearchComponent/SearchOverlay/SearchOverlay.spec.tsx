import { render, screen } from '@testing-library/react'
import { createRef } from 'react'

import { SearchOverlay } from './SearchOverlay'

vi.mock('next-i18next/pages', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))

vi.mock('../LanguageSelector', () => ({
  LanguageSelector: () => <div data-testid="LanguageSelector" />
}))

vi.mock('../CategoryGrid', () => ({
  CategoryGrid: ({
    onCategorySelect
  }: {
    onCategorySelect: (value: string) => void
  }) => (
    <div
      data-testid="CategoryGrid"
      onClick={() => onCategorySelect('category')}
    />
  )
}))

vi.mock('../SearchResultsLayout', () => ({
  SearchResultsLayout: () => <div data-testid="SearchResultsLayout" />
}))

describe('SearchOverlay', () => {
  it('renders fallback trending content when trending data fails', () => {
    const onSelect = vi.fn()
    const containerRef = createRef<HTMLDivElement>()

    render(
      <SearchOverlay
        open
        hasQuery={false}
        searchQuery=""
        onBlur={vi.fn()}
        onSelectQuickValue={onSelect}
        containerRef={containerRef}
        languageId="en"
        onClose={vi.fn()}
        trendingSearches={['Hope', 'Faith']}
        isTrendingLoading={false}
        isTrendingFallback
        onClearSearch={vi.fn()}
      />
    )

    expect(screen.getByText('Popular Searches')).toBeInTheDocument()
    expect(screen.getByText('Hope')).toBeInTheDocument()
    expect(screen.getByText('Faith')).toBeInTheDocument()
  })
})
