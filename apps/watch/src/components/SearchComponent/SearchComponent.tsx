import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Container from '@mui/material/Container'
import Grid from '@mui/material/GridLegacy'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { RefinementListItem } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList'
import { useTranslation } from 'next-i18next'
import {
  FocusEvent,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { useSearchBox } from 'react-instantsearch'

import { SearchBarProvider } from '@core/journeys/ui/algolia/SearchBarProvider'
import Bible from '@core/shared/ui/icons/Bible'
import Book from '@core/shared/ui/icons/Book'
import Calendar1 from '@core/shared/ui/icons/Calendar1'
import Play1 from '@core/shared/ui/icons/Play1'
import Star2 from '@core/shared/ui/icons/Star2'
import VideoOn from '@core/shared/ui/icons/VideoOn'

import { useTrendingSearches } from '../../hooks/useTrendingSearches'
import { AlgoliaVideoGrid } from '../VideoGrid/AlgoliaVideoGrid'
import { VideoGrid } from '../VideoGrid/VideoGrid'

import { Badge } from '@ui/components/badge'
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal
} from '@ui/components/dialog'
import { LanguageSelector } from './LanguageSelector'
import { SimpleSearchBar } from './SimpleSearchBar'

interface SearchComponentProps {
  languageId?: string
  floating?: boolean
}

interface SearchOverlayProps {
  open: boolean
  hasQuery: boolean
  searchQuery: string
  onBlur: (event: FocusEvent<HTMLDivElement>) => void
  onSelectQuickValue: (value: string) => void
  containerRef: React.RefObject<HTMLDivElement | null>
  languageId?: string
  onClose: () => void
}

interface QuickListProps {
  title: string
  items: string[]
  onSelect: (value: string) => void
  isLoading?: boolean
}

interface CategoryItem {
  title: string
  icon: React.ComponentType<any>
  gradient: string
  searchTerm: string
}

const CategoryTile = styled(ButtonBase)(({ theme }) => ({
  borderRadius: 8,
  aspectRatio: '16 / 9',
  width: '100%',
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(2),
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'scale(1.02)',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.short
    })
  },
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 2
  }
}))

function generateRelatedSearches(query: string): string[] {
  if (!query || query.trim().length === 0) return []

  const baseQuery = query.trim().toLowerCase()
  const relatedSuggestions: string[] = []

  // Define common related terms for different topics
  const relatedTerms = {
    // Faith/Religious terms
    faith: ['hope', 'trust', 'belief', 'prayer', 'worship'],
    hope: ['faith', 'trust', 'encouragement', 'inspiration', 'peace'],
    prayer: ['worship', 'meditation', 'faith', 'devotion', 'thanksgiving'],
    worship: ['praise', 'prayer', 'music', 'celebration', 'adoration'],
    bible: ['scripture', 'verse', 'study', 'devotion', 'teaching'],

    // Life topics
    family: ['parenting', 'marriage', 'children', 'relationships', 'home'],
    marriage: ['family', 'relationships', 'love', 'commitment', 'couples'],
    children: ['family', 'parenting', 'youth', 'kids', 'education'],
    youth: ['teens', 'children', 'young adults', 'students', 'ministry'],

    // Occasions/Seasons
    christmas: ['holiday', 'celebration', 'nativity', 'advent', 'winter'],
    easter: ['resurrection', 'spring', 'celebration', 'new life', 'hope'],
    holiday: ['christmas', 'celebration', 'family', 'tradition', 'season'],

    // Teaching/Learning
    teaching: ['education', 'learning', 'study', 'instruction', 'wisdom'],
    study: ['learning', 'bible', 'education', 'research', 'knowledge'],
    wisdom: ['teaching', 'knowledge', 'understanding', 'guidance', 'insight']
  }

  // Find related terms for the base query
  const directMatches = relatedTerms[baseQuery] || []
  relatedSuggestions.push(...directMatches.slice(0, 3))

  // Look for partial matches
  Object.entries(relatedTerms).forEach(([key, values]) => {
    if (key.includes(baseQuery) || baseQuery.includes(key)) {
      relatedSuggestions.push(...values.slice(0, 2))
    }
  })

  // Generate contextual suggestions
  const contextualSuggestions = [
    `${baseQuery} study`,
    `${baseQuery} sermon`,
    `${baseQuery} message`,
    `${baseQuery} story`,
    `${baseQuery} teaching`
  ]

  relatedSuggestions.push(...contextualSuggestions.slice(0, 2))

  // Remove duplicates and the original query
  const uniqueSuggestions = [...new Set(relatedSuggestions)]
    .filter((suggestion) => suggestion.toLowerCase() !== baseQuery)
    .slice(0, 6) // Limit to 6 suggestions

  return uniqueSuggestions
}

function CategoryGrid({
  onCategorySelect
}: {
  onCategorySelect: (searchTerm: string) => void
}): ReactElement {
  const { t } = useTranslation('apps-watch')

  const categories: CategoryItem[] = [
    {
      title: t('Bible Stories'),
      icon: Bible,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      searchTerm: 'bible stories'
    },
    {
      title: t('Worship'),
      icon: Star2,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      searchTerm: 'worship'
    },
    {
      title: t('Teaching'),
      icon: Book,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      searchTerm: 'teaching'
    },
    {
      title: t('Youth'),
      icon: Play1,
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      searchTerm: 'youth'
    },
    {
      title: t('Family'),
      icon: VideoOn,
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      searchTerm: 'family'
    },
    {
      title: t('Holiday'),
      icon: Calendar1,
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      searchTerm: 'holiday'
    }
  ]

  return (
    <Box>
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ display: 'block', mb: 3, fontWeight: 600 }}
      >
        {t('Browse Categories')}
      </Typography>
      <Grid container spacing={4} rowSpacing={4}>
        {categories.map((category, index) => {
          const IconComponent = category.icon
          return (
            <Grid item xs={12} md={4} xl={3} key={index}>
              <CategoryTile
                onClick={() => onCategorySelect(category.searchTerm)}
                sx={{
                  background: category.gradient,
                  color: 'white',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}
              >
                <IconComponent
                  sx={{
                    fontSize: 48,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                  }}
                />
                <Typography
                  variant="h6"
                  fontWeight={600}
                  textAlign="center"
                  sx={{
                    textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                    lineHeight: 1.2
                  }}
                >
                  {category.title}
                </Typography>
              </CategoryTile>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}

function QuickList({
  title,
  items,
  onSelect,
  isLoading = false
}: QuickListProps): ReactElement | null {
  if (isLoading) {
    return (
      <Box>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ display: 'block', mb: 3 }}
        >
          {title}
        </Typography>
        <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
          {Array.from({ length: 6 }).map((_, index) => (
            <Badge
              key={index}
              variant="outline"
              className="opacity-50 cursor-not-allowed px-3 py-1 rounded-full font-medium"
            >
              Loading...
            </Badge>
          ))}
        </Stack>
      </Box>
    )
  }

  if (!Array.isArray(items) || items.length === 0) return null

  return (
    <Box>
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ display: 'block', mb: 3 }}
      >
        {title}
      </Typography>
      <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
        {items.map((item) => (
          <Badge
            key={item}
            variant="outline"
            className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors px-3 py-1 rounded-full font-medium"
            onClick={() => onSelect(item)}
            onMouseDown={(event) => event.preventDefault()}
          >
            {item}
          </Badge>
        ))}
      </Stack>
    </Box>
  )
}

function SearchOverlay({
  open,
  hasQuery,
  searchQuery,
  onBlur,
  onSelectQuickValue,
  containerRef,
  languageId,
  onClose
}: SearchOverlayProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const {
    trendingSearches,
    isLoading: isTrendingLoading,
    error: trendingError,
    fetchTrendingSearches
  } = useTrendingSearches(8)

  // Trigger fetch when overlay opens for the first time
  useEffect(() => {
    if (
      open &&
      trendingSearches.length === 0 &&
      !isTrendingLoading &&
      !trendingError
    ) {
      fetchTrendingSearches()
    }
  }, [
    open,
    trendingSearches.length,
    isTrendingLoading,
    trendingError,
    fetchTrendingSearches
  ])

  // Fallback to translations if trending searches fail
  const popularSearches = useMemo(() => {
    if (trendingError) {
      const result = t('popularSearches', { returnObjects: true }) as
        | string[]
        | undefined
      return Array.isArray(result) ? result : []
    }
    return trendingSearches
  }, [trendingSearches, trendingError, t])

  const popularCategories = useMemo(() => {
    const result = t('popularCategories', { returnObjects: true }) as
      | string[]
      | undefined
    return Array.isArray(result) ? result : []
  }, [t])

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogPortal>
        <DialogOverlay className="blured-bg" />
        <DialogContent
          ref={containerRef}
          onBlur={onBlur}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          className="
            fixed inset-x-0 bottom-0 top-[100px] lg:top-[159px] max-w-none
            overflow-y-auto overscroll-contain p-0 border-0
            translate-x-0 translate-y-0 left-0
          "
          data-testid="SearchOverlay"
        >
          <Container
            maxWidth="xxl"
            sx={{
              px: { xs: 4, md: 12 },
              pt: { xs: 8, md: 12 },
              pb: { xs: 10, md: 16 }
            }}
          >
            {!hasQuery ? (
              // Show category browse layout when no search query
              <Stack spacing={{ xs: 6, md: 8 }}>
                {/* Top row - Trending searches (50%) + Language filter (50%) */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: { xs: 4, md: 6 }
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <QuickList
                      title={
                        trendingError
                          ? t('Popular Searches')
                          : t('Trending Searches')
                      }
                      items={popularSearches}
                      onSelect={onSelectQuickValue}
                      isLoading={isTrendingLoading}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="overline"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 3, fontWeight: 600 }}
                    >
                      {t('Search Filters')}
                    </Typography>
                    <LanguageSelector />
                  </Box>
                </Box>

                {/* Bottom row - Category grid (full width) */}
                <CategoryGrid onCategorySelect={onSelectQuickValue} />
              </Stack>
            ) : (
              // Show search results layout when there's a query
              <Stack spacing={{ xs: 4, md: 6 }}>
                {/* Top row - Related searches + Language filter */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: { xs: 4, md: 6 }
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <QuickList
                      title={t('Related Searches')}
                      items={generateRelatedSearches(searchQuery)}
                      onSelect={onSelectQuickValue}
                      isLoading={false}
                    />
                  </Box>
                  <Box
                    sx={{ width: { xs: '100%', md: '320px' }, flexShrink: 0 }}
                  >
                    <Typography
                      variant="overline"
                      color="text.secondary"
                      sx={{ display: 'block', mb: 3, fontWeight: 600 }}
                    >
                      {t('Search Filters')}
                    </Typography>
                    <LanguageSelector />
                  </Box>
                </Box>

                {/* Search results - Full width */}
                <AlgoliaVideoGrid
                  variant="contained"
                  languageId={languageId}
                  showLoadMore
                />
              </Stack>
            )}
          </Container>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}

export function SearchComponent({
  languageId,
  floating = true
}: SearchComponentProps): ReactElement {
  const { refine } = useSearchBox()
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchValue, setSearchValue] = useState('') // Track input field value
  const [isSearching, setIsSearching] = useState(false)
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  const trimmedQuery = searchQuery.trim()

  // Manual loading state
  const loading = isSearching

  // Clear search on component mount to prevent any existing search
  useEffect(() => {
    refine('')
  }, [])

  // Focus search input when overlay opens
  useEffect(() => {
    if (isSearchActive && searchInputRef.current) {
      // Multiple attempts to ensure focus works with Dialog
      const focusInput = () => {
        if (searchInputRef.current) {
          searchInputRef.current.focus()
          searchInputRef.current.click() // Ensure it's clickable
        }
      }

      // Immediate focus
      focusInput()

      // Backup focus attempts
      const timer1 = setTimeout(focusInput, 50)
      const timer2 = setTimeout(focusInput, 150)
      const timer3 = setTimeout(focusInput, 300)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    }
  }, [isSearchActive])

  const handleSearchFocus = useCallback(() => {
    setIsSearchActive(true)
  }, [])

  const handleCloseSearch = useCallback(() => {
    // Clear search when overlay closes
    setIsSearchActive(false)
    setSearchValue('')
    setSearchQuery('')
    refine('')
  }, [refine])

  const handleSearchBlur = useCallback(
    (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const nextTarget = event.relatedTarget as Node | null
      if (nextTarget != null && overlayRef.current?.contains(nextTarget)) return

      // Check if focus moved to a Radix UI popover/portal element
      if (
        nextTarget &&
        (nextTarget.closest('[data-radix-popover-content]') ||
          nextTarget.closest('[role="combobox"]') ||
          nextTarget.closest('[cmdk-root]') ||
          nextTarget.closest('[data-slot="popover-content"]'))
      ) {
        return
      }

      handleCloseSearch()
    },
    [handleCloseSearch]
  )

  const handleOverlayBlur = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      const nextTarget = event.relatedTarget as Node | null
      if (
        nextTarget != null &&
        (overlayRef.current?.contains(nextTarget) ?? false)
      )
        return
      if (nextTarget === searchInputRef.current) return

      // Check if focus moved to a Radix UI popover/portal element
      if (
        nextTarget &&
        (nextTarget.closest('[data-radix-popover-content]') ||
          nextTarget.closest('[role="combobox"]') ||
          nextTarget.closest('[cmdk-root]') ||
          nextTarget.closest('[data-slot="popover-content"]'))
      ) {
        return
      }

      handleCloseSearch()
    },
    [handleCloseSearch]
  )

  const handleSearch = useCallback(
    (query: string) => {
      setIsSearching(true)
      setSearchQuery(query)
      setSearchValue(query) // Keep input field in sync
      refine(query)
      // Reset loading state after a short delay
      setTimeout(() => setIsSearching(false), 1000)
    },
    [refine]
  )

  const handleQuickSelect = useCallback(
    (value: string) => {
      handleSearch(value)
      setIsSearchActive(true)
      requestAnimationFrame(() => {
        searchInputRef.current?.focus()
      })
    },
    [handleSearch]
  )

  useEffect(() => {
    if (!isSearchActive) return

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        event.preventDefault()
        handleCloseSearch()
        searchInputRef.current?.blur()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSearchActive, handleCloseSearch])

  const searchFieldElement = (
    <div
      className={
        floating
          ? 'w-full max-w-[1800px] min-w-[800px]'
          : 'w-full min-w-[600px]'
      }
    >
      <SimpleSearchBar
        loading={loading && trimmedQuery.length > 0}
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
          hasQuery={trimmedQuery.length > 0}
          searchQuery={searchQuery}
          onBlur={handleOverlayBlur}
          onSelectQuickValue={handleQuickSelect}
          containerRef={overlayRef}
          languageId={languageId}
          onClose={handleCloseSearch}
        />
      </>
    </SearchBarProvider>
  )
}
