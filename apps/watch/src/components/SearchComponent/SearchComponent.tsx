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
    handleClearSearch,
    trendingSearches,
    isTrendingLoading,
    isTrendingFallback
  } = useFloatingSearchOverlay()

  return (
    <SearchBarProvider>
      <div
        className="fixed top-6 left-0 right-0 z-[100] px-4 lg:top-[76px] lg:left-1/2 lg:right-auto lg:w-[calc(100%-60px)] lg:max-w-[800px] lg:min-w-[300px] lg:-translate-x-1/2 lg:px-0"
      >
        <div className="w-full lg:max-w-[70%] lg:min-w-[60%] mx-auto">
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
        onClearSearch={handleClearSearch}
      />
    </SearchBarProvider>
  )
}
