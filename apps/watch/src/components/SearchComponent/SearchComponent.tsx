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
      <div className="fixed left-0 right-0 top-6 sm:top-8 lg:top-[76px] z-[100] px-4 sm:px-6 md:px-8">
        <div className="mx-auto w-full max-w-[800px]">
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
