import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import { SearchBarProvider } from '@core/journeys/ui/algolia/SearchBarProvider'

import { SimpleSearchBar } from './SimpleSearchBar'
import { SearchOverlay } from './SearchOverlay'
import { useFloatingSearchOverlay } from './hooks/useFloatingSearchOverlay'

interface SearchComponentProps {
  languageId?: string
  floating?: boolean
}

export function SearchComponent({
  languageId,
  floating = true
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

  const searchFieldElement = (
    <div
      className={
        floating
          ? 'w-full max-w-[1800px] min-w-[800px]'
          : 'w-full min-w-[600px]'
      }
    >
      <SimpleSearchBar
        loading={loading && hasQuery}
        value={searchValue}
        onSearch={handleSearch}
        onFocus={handleSearchFocus}
        onBlur={handleSearchBlur}
        props={{ inputRef: searchInputRef }}
      />
    </div>
  )

  return (
    <SearchBarProvider>
      <>
        {floating ? (
          <Box
            sx={{
              position: 'fixed',
              top: { xs: '80px', lg: '69px' },
              left: '50%',
              transform: 'translateX(-50%)',
              width: { xs: 'calc(100% - 32px)', md: 'auto' },
              minWidth: '300px',
              zIndex: 100,
              px: { xs: 2, md: 0 }
            }}
          >
            {searchFieldElement}
          </Box>
        ) : (
          searchFieldElement
        )}
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
      </>
    </SearchBarProvider>
  )
}
