import { ReactElement } from 'react'

import { SearchBarProvider } from '@core/journeys/ui/algolia/SearchBarProvider'

import { useFloatingSearchOverlay } from './hooks/useFloatingSearchOverlay'
import { SearchOverlay } from './SearchOverlay'
import { SimpleSearchBar } from './SimpleSearchBar'

interface SearchComponentProps {
  languageId?: string
}

export function SearchComponent({
  languageId
}: SearchComponentProps): ReactElement {
  const {
    searchInputRef,
    overlayRef,
    isSearchActive,
    hasQuery,
    searchQuery,
    searchValue,
    loading,
    handleSearch,
    handleSearchFocus,
    handleSearchBlur,
    handleOverlayBlur,
    handleQuickSelect,
    handleCloseSearch,
    trendingSearches,
    isTrendingLoading,
    isTrendingFallback
  } = useFloatingSearchOverlay()

  return (
    <SearchBarProvider>
      <div className="fixed top-[26px] lg:top-[76px] left-1/2 -translate-x-1/2 w-[calc(100%-60px)] min-w-[300px] max-w-[800px] z-[100] px-2 md:px-0">
        <div className="w-full max-w-[70%] min-w-[60%] mx-auto">
          <SimpleSearchBar
            loading={loading && hasQuery}
            value={searchValue}
            onSearch={handleSearch}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            props={{ inputRef: searchInputRef }}
          />
        </div>
      </div>
      <SearchOverlay
        open={isSearchActive}
        hasQuery={hasQuery}
        searchQuery={searchQuery}
        onBlur={handleOverlayBlur}
        onSelectQuickValue={handleQuickSelect}
        containerRef={overlayRef}
        languageId={languageId}
        onClose={handleCloseSearch}
        trendingSearches={trendingSearches}
        isTrendingLoading={isTrendingLoading}
        isTrendingFallback={isTrendingFallback}
      />
    </SearchBarProvider>
  )
}
