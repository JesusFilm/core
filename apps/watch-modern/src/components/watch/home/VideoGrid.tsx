"use client"

import type { Hit as AlgoliaHit } from 'instantsearch.js'
import { Hits, useInstantSearch, usePagination, useSearchBox } from 'react-instantsearch'
import { Card } from '@/components/ui/card'
import { Container } from '@/components/ui/container'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { MediaCard, type MediaCardProps } from './MediaCard'
import { Skeleton } from '@/components/ui/skeleton'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { memo, useMemo, useCallback, useState } from 'react'
import { cn } from '@/lib/utils'
import { SearchBar } from '@/components/watch/search/SearchBar'

type AlgoliaVideo = AlgoliaHit<{
  videoId: string
  titles: string[]
  titlesWithLanguages: {
    languageId: string
    value: string
  }[]
  description: string[]
  duration: number
  languageId: string
  slug: string
  label: string
  image: string
  imageAlt: string
  childrenCount: number
  objectID: string
}>

/**
 * Transforms AlgoliaVideo to MediaCard props
 */
function transformToMediaCardProps(hit: AlgoliaVideo): MediaCardProps {
  console.log('🔍 transformToMediaCardProps called for hit:', hit?.objectID || 'unknown')

  // Get title from titlesWithLanguages or fallback to titles
  let title = ''
  if (hit.titlesWithLanguages && hit.titlesWithLanguages.length > 0) {
    title = hit.titlesWithLanguages[0]?.value || ''
  } else if (hit.titles && hit.titles.length > 0) {
    title = hit.titles[0] || ''
  }
  console.log('🔍 Title extracted:', title)

  // Map label to videoType
  let videoType: string
  switch (hit.label) {
    case 'featureFilm':
      videoType = 'Feature Film'
      break
    case 'series':
      videoType = 'Collection'
      break
    case 'segment':
      videoType = 'Chapter'
      break
    default:
      videoType = 'Documentary'
  }
  console.log('🔍 Video type mapped to:', videoType)

  // Map videoType to MediaKind
  let kind: MediaCardProps['kind'] = 'episode' // default
  switch (videoType) {
    case 'Feature Film':
      kind = 'feature-film'
      break
    case 'Chapter':
      kind = 'chapter'
      break
    case 'Collection':
      kind = 'collection'
      break
    case 'Documentary':
      kind = 'episode' // fallback
      break
  }
  console.log('🔍 Media kind determined as:', kind)

  // Create count label for collections/series
  let countLabel: string | undefined = undefined
  if (hit.childrenCount && hit.childrenCount > 1) {
    if (kind === 'collection') {
      countLabel = `${hit.childrenCount} items`
    } else {
      countLabel = `${hit.childrenCount} chapters`
    }
  }
  console.log('🔍 Count label:', countLabel)

  // Convert duration from seconds to MM:SS format for display
  let durationSeconds: number | undefined
  if (hit.duration) {
    durationSeconds = hit.duration
  }
  console.log('🔍 Duration seconds:', durationSeconds)

  const result = {
    href: `/watch/${hit.slug}`,
    title,
    kind,
    countLabel,
    durationSeconds,
    imageUrl: hit.image
  }
  console.log('🔍 transformToMediaCardProps result:', result)

  return result
}

// New SearchBar container - Phase 3 implementation with suggestions
const SearchBarContainer = memo(function SearchBarContainer({
  isSuggestionsOpen,
  onSuggestionsOpenChange
}: {
  isSuggestionsOpen: boolean
  onSuggestionsOpenChange: (open: boolean) => void
}) {
  const { status } = useInstantSearch()
  const { query, refine } = useSearchBox()

  // Memoize loading state
  const isLoading = useMemo(() => {
    console.log('🔍 InstantSearch status changed to:', status)
    return status === 'loading' || status === 'stalled'
  }, [status])

  // Handle search submission - Phase 3: Update grid directly
  const handleSubmit = useCallback((value: string) => {
    console.log('🔍 VideoGrid handleSubmit called with value:', value)
    console.log('🔍 Current query:', query)

    // Only refine if value actually changed from current query
    // Note: We no longer handle clearing from non-empty to empty here
    // since clear button now handles this locally
    const shouldRefine = value !== query
    console.log('🔍 Should refine?', shouldRefine)

    if (shouldRefine) {
      console.log('🔍 Calling refine with:', value)
      refine(value)
      console.log('🔍 Refine call completed')
    } else {
      console.log('🔍 Skipping refine - value same as current query')
    }

    console.log('🔍 Closing suggestions')
    onSuggestionsOpenChange(false)
    console.log('🔍 handleSubmit completed')
  }, [refine, onSuggestionsOpenChange, query])

  // Handle focus - Phase 3: Will show popular suggestions
  const handleFocus = useCallback(() => {
    onSuggestionsOpenChange(true)
    // Phase 3: Suggestions are now handled by SearchBar component
  }, [onSuggestionsOpenChange])

  // Handle suggestions close
  const handleSuggestionsClose = useCallback(() => {
    onSuggestionsOpenChange(false)
  }, [onSuggestionsOpenChange])

  return (
    <SearchBar
      initialValue={query || ''}
      onSubmit={handleSubmit}
      onFocus={handleFocus}
      onSuggestionsClose={handleSuggestionsClose}
      loading={isLoading}
      placeholder="Search videos, films, and series..."
      isSuggestionsOpen={isSuggestionsOpen}
    />
  )
})

const EmptyState = memo(function EmptyState({ isSuggestionsOpen }: { isSuggestionsOpen?: boolean }) {
  const { clear } = useSearchBox()

  // Memoize the clear handler to prevent recreation on each render
  const handleEmptyStateClear = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      clear()
    } catch (error) {
      console.error('Error calling clear function:', error)
    }
  }, [clear])

  return (
    <div
      className={cn(
        "col-span-full flex flex-col items-center justify-center py-16 text-center",
        isSuggestionsOpen && "pointer-events-none aria-hidden"
      )}
      aria-hidden={isSuggestionsOpen}
    >
      <div className="mb-4 text-6xl">🔍</div>
      <h3 className="text-xl font-semibold text-foreground mb-2">No videos found</h3>
      <p className="text-muted-foreground max-w-md">
        We couldn't find any videos matching your search. Try adjusting your search terms or browse our full collection.
      </p>
      <div className="mt-6">
        <button
          onClick={handleEmptyStateClear}
          disabled={isSuggestionsOpen}
          className={cn(
            "px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-colors",
            isSuggestionsOpen && "pointer-events-none opacity-50"
          )}
          aria-label="Clear search and show all videos"
        >
          Clear Search
        </button>
      </div>
    </div>
  )
})

/**
 * Custom pagination component using shadcn pagination with InstantSearch
 */
function ShadcnPagination() {
  const { currentRefinement, nbPages, refine } = usePagination()

  if (nbPages <= 1) {
    return null
  }

  const handlePageChange = (page: number) => {
    refine(page)
  }

  const renderPageNumbers = () => {
    const pages = []
    const currentPage = currentRefinement
    const totalPages = nbPages

    // Always show first page
    if (currentPage > 2) {
      pages.push(
        <PaginationItem key={0}>
          <PaginationLink
            size="lg"
            onClick={() => handlePageChange(0)}
            isActive={currentPage === 0}
            className="px-4 py-3 text-lg font-light min-w-[3rem] h-12"
          >
            1
          </PaginationLink>
        </PaginationItem>
      )
      if (currentPage > 3) {
        pages.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis className="h-12 w-12" />
          </PaginationItem>
        )
      }
    }

    // Show pages around current page
    const startPage = Math.max(0, currentPage - 1)
    const endPage = Math.min(totalPages - 1, currentPage + 1)

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            size="lg"
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
            className="px-4 py-3 text-lg font-light min-w-[3rem] h-12"
          >
            {i + 1}
          </PaginationLink>
        </PaginationItem>
      )
    }

    // Always show last page
    if (currentPage < totalPages - 3) {
      if (currentPage < totalPages - 4) {
        pages.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis className="h-12 w-12" />
          </PaginationItem>
        )
      }
      pages.push(
        <PaginationItem key={totalPages - 1}>
          <PaginationLink
            size="lg"
            onClick={() => handlePageChange(totalPages - 1)}
            isActive={currentPage === totalPages - 1}
            className="px-4 py-3 text-lg font-light min-w-[3rem] h-12"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      )
    }

    return pages
  }

  return (
    <Pagination className="scale-150 origin-center">
      <PaginationContent className="gap-3">
        <PaginationItem>
          <PaginationPrevious
            size="lg"
            onClick={() => currentRefinement > 0 && handlePageChange(currentRefinement - 1)}
            className={`px-6 py-3 text-lg font-light ${currentRefinement === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-primary/10'}`}
          />
        </PaginationItem>

        {renderPageNumbers()}

        <PaginationItem>
          <PaginationNext
            size="lg"
            onClick={() => currentRefinement < nbPages - 1 && handlePageChange(currentRefinement + 1)}
            className={`px-6 py-3 text-lg font-light ${currentRefinement >= nbPages - 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:bg-primary/10'}`}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

/**
 * Skeleton component for individual video cards
 */
function VideoCardSkeleton() {
  return (
    <Card className="rounded-xl overflow-hidden border-0 shadow-none">
      <div className="relative shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-xl overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 border border-white/10">
        <AspectRatio ratio={16/9}>
          <Skeleton className="h-full w-full" />
        </AspectRatio>
      </div>

      {/* Type label and title skeleton below thumbnail */}
      <div className="py-4">
        <Skeleton className="h-4 w-20 mb-1" />
        <Skeleton className="h-6 w-full mb-1" />
        <Skeleton className="h-6 w-3/4" />
      </div>
    </Card>
  )
}

/**
 * Skeleton grid for the 4-column layout (max 4 items per row)
 */
function NewGridSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-4 md:gap-5 lg:gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="col-span-4 sm:col-span-2 lg:col-span-1">
          <VideoCardSkeleton />
        </div>
      ))}
    </div>
  )
}

/**
 * New Hit component using MediaCard for the redesigned grid
 */
function NewHit({ hit }: { hit: AlgoliaVideo }) {
  console.log('🔍 NewHit rendering hit:', hit?.objectID || 'unknown', 'title:', hit?.titles?.[0] || 'unknown')
  const mediaCardProps = transformToMediaCardProps(hit)
  console.log('🔍 NewHit mediaCardProps:', mediaCardProps)
  return <MediaCard {...mediaCardProps} />
}

export const VideoGrid = memo(function VideoGrid() {
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false)

  return (
    <section
      id="videos"
      className="py-8"
      aria-labelledby="videos-heading"
    >
      <Container>
        <div className="mb-8">
          <h2 id="videos-heading" className="sr-only">Video Library</h2>
          <SearchBarContainer isSuggestionsOpen={isSuggestionsOpen} onSuggestionsOpenChange={setIsSuggestionsOpen} />
        </div>

        <NewHitsGridWithEmptyState isSuggestionsOpen={isSuggestionsOpen} />

        <div className="mt-8">
          <ShadcnPagination />
        </div>
      </Container>
    </section>
  )
})

/**
 * Custom Hits component for the 4-column grid design (max 4 items per row)
 */
function NewHitsGrid() {
  console.log('🔍 NewHitsGrid rendering')
  return (
    <Hits
      hitComponent={NewHitWrapper}
      classNames={{
        list: 'grid grid-cols-4 gap-4 md:gap-5 lg:gap-6',
        item: 'w-full'
      }}
    />
  )
}

/**
 * Wrapper component to handle hit rendering
 */
function NewHitWrapper({ hit }: { hit: AlgoliaVideo }) {
  console.log('🔍 NewHitWrapper rendering hit:', hit?.objectID || 'unknown')
  return (
    <div className="col-span-4 sm:col-span-2 lg:col-span-1">
      <NewHit hit={hit} />
    </div>
  )
}

/**
 * Hits grid with empty state and loading skeleton for new design
 */
const NewHitsGridWithEmptyState = memo(function NewHitsGridWithEmptyState({ isSuggestionsOpen }: { isSuggestionsOpen: boolean }) {
  const { results, status } = useInstantSearch()
  const { query } = useSearchBox()

  // Memoize derived values to prevent unnecessary re-renders
  const isLoading = useMemo(() => {
    console.log('🔍 NewHitsGridWithEmptyState - status:', status)
    return status === 'loading' || status === 'stalled'
  }, [status])

  const isEmptyQuery = useMemo(() => {
    const empty = !query || query.trim() === ''
    console.log('🔍 NewHitsGridWithEmptyState - query:', query, 'isEmptyQuery:', empty)
    return empty
  }, [query])

  const shouldShowEmptyState = useMemo(() => {
    console.log('🔍 NewHitsGridWithEmptyState - results:', results)
    if (isEmptyQuery) {
      console.log('🔍 Showing empty state because query is empty')
      return true
    }
    const hasNoHits = results && typeof results.nbHits === 'number' && results.nbHits === 0
    console.log('🔍 Has no hits:', hasNoHits, 'nbHits:', results?.nbHits)
    return hasNoHits
  }, [results, isEmptyQuery])

  // Show skeleton during loading
  if (isLoading && !isEmptyQuery) {
    return <NewGridSkeleton />
  }

  // Show empty state when no results
  if (shouldShowEmptyState) {
    return <EmptyState isSuggestionsOpen={isSuggestionsOpen} />
  }

  return <NewHitsGrid />
})
