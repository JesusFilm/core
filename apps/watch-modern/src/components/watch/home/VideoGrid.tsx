"use client"

import type { Hit as AlgoliaHit } from 'instantsearch.js'
import { Search, X } from 'lucide-react'
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
import { memo, useMemo, useCallback } from 'react'

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
  // Get title from titlesWithLanguages or fallback to titles
  let title = ''
  if (hit.titlesWithLanguages && hit.titlesWithLanguages.length > 0) {
    title = hit.titlesWithLanguages[0]?.value || ''
  } else if (hit.titles && hit.titles.length > 0) {
    title = hit.titles[0] || ''
  }

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


  // Create count label for collections/series
  let countLabel: string | undefined = undefined
  if (hit.childrenCount && hit.childrenCount > 1) {
    if (kind === 'collection') {
      countLabel = `${hit.childrenCount} items`
    } else {
      countLabel = `${hit.childrenCount} chapters`
    }
  }

  // Convert duration from seconds to MM:SS format for display
  let durationSeconds: number | undefined
  if (hit.duration) {
    durationSeconds = hit.duration
  }

  return {
    href: `/watch/${hit.slug}`,
    title,
    kind,
    countLabel,
    durationSeconds,
    imageUrl: hit.image
  }
}

const SearchBoxWithLoading = memo(function SearchBoxWithLoading() {
  console.log('🔍 SearchBoxWithLoading: Component rendering')

  const { status } = useInstantSearch()
  const { query, refine, clear } = useSearchBox()

  // Memoize derived values to prevent unnecessary re-renders
  const isSearching = useMemo(() => status === 'loading' || status === 'stalled', [status])
  const hasQuery = useMemo(() => Boolean(query && query.trim().length > 0), [query])

  console.log('🔍 SearchBoxWithLoading: State values:', {
    status,
    query,
    isSearching,
    hasQuery,
    clearFunctionType: typeof clear,
    clearFunctionExists: !!clear
  })

  // Update query as user types (controlled input)
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      refine(e.currentTarget.value)
    },
    [refine]
  )

  // Memoize the clear handler to prevent recreation on each render
  const handleClear = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('🔍 Clear button clicked (input X button)')
    console.log('🔍 Event details:', {
      type: e.type,
      target: e.target,
      currentTarget: e.currentTarget
    })
    console.log('🔍 Before preventDefault and stopPropagation')

    e.preventDefault()
    e.stopPropagation()

    console.log('🔍 After preventDefault and stopPropagation')
    console.log('🔍 About to call clear() function')
    console.log('🔍 Current query before clear:', query)

    try {
      // Use refine('') to guarantee the input value updates immediately
      refine('')
      // Call clear as well to reset any auxiliary state managed by the connector
      clear()
      console.log('🔍 Clear function called successfully')
    } catch (error) {
      console.error('🔍 Error calling clear function:', error)
    }

    console.log('🔍 Clear button click handler finished')
  }, [clear, refine])

  return (
    <div className="relative max-w-3xl mx-auto" role="search">
      <input
        type="text"
        value={query}
        onChange={onChange}
        className="h-16 w-full rounded-xl border border-gray-300 bg-white pl-14 pr-16 py-5 text-lg text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-colors shadow-sm hover:shadow-md"
        placeholder="Search videos, films, and series..."
        aria-label="Search videos"
      />
      {/* Search icon on the left */}
      <div className="absolute left-5 top-[22px] text-gray-400" aria-hidden="true">
        <Search className="h-6 w-6" />
      </div>

      {/* Clear button on the right (when there's a query) */}
      {hasQuery && !isSearching && (
        <button
          onClick={handleClear}
          className="absolute right-5 top-[22px] text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:text-gray-600 z-10"
          aria-label="Clear search"
          type="button"
        >
          <X className="h-6 w-6" />
        </button>
      )}

      {/* Loading spinner on the right (when searching) */}
      {isSearching && (
        <div className="absolute right-5 top-[22px]" aria-hidden="true">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  )
})

const EmptyState = memo(function EmptyState() {
  console.log('🔍 EmptyState: Component rendering')

  const { clear } = useSearchBox()

  console.log('🔍 EmptyState: useSearchBox hook called, clear function details:', {
    clearFunctionType: typeof clear,
    clearFunctionExists: !!clear
  })

  // Memoize the clear handler to prevent recreation on each render
  const handleEmptyStateClear = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('🔍 Clear Search button clicked (empty state button)')
    console.log('🔍 Event details:', {
      type: e.type,
      target: e.target,
      currentTarget: e.currentTarget
    })
    console.log('🔍 Before preventDefault and stopPropagation')

    e.preventDefault()
    e.stopPropagation()

    console.log('🔍 After preventDefault and stopPropagation')
    console.log('🔍 About to call clear() function from EmptyState')

    try {
      clear()
      console.log('🔍 Clear function from EmptyState called successfully')
    } catch (error) {
      console.error('🔍 Error calling clear function from EmptyState:', error)
    }

    console.log('🔍 Clear Search button click handler finished')
  }, [clear])

  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-6xl">🔍</div>
      <h3 className="text-xl font-semibold text-foreground mb-2">No videos found</h3>
      <p className="text-muted-foreground max-w-md">
        We couldn't find any videos matching your search. Try adjusting your search terms or browse our full collection.
      </p>
      <div className="mt-6">
        <button
          onClick={handleEmptyStateClear}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-colors"
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
  const mediaCardProps = transformToMediaCardProps(hit)
  return <MediaCard {...mediaCardProps} />
}

export const VideoGrid = memo(function VideoGrid() {
  console.log('🔍 VideoGrid: Main component rendering')

  return (
    <section
      id="videos"
      className="py-8"
      aria-labelledby="videos-heading"
    >
      <Container>
        <div className="mb-8">
          <h2 id="videos-heading" className="sr-only">Video Library</h2>
          <SearchBoxWithLoading />
        </div>

        <NewHitsGridWithEmptyState />

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
  return (
    <div className="col-span-4 sm:col-span-2 lg:col-span-1">
      <NewHit hit={hit} />
    </div>
  )
}

/**
 * Hits grid with empty state and loading skeleton for new design
 */
const NewHitsGridWithEmptyState = memo(function NewHitsGridWithEmptyState() {
  console.log('🔍 NewHitsGridWithEmptyState: Component rendering')

  const { results, status } = useInstantSearch()
  const { query } = useSearchBox()

  // Memoize derived values to prevent unnecessary re-renders
  const isLoading = useMemo(() => status === 'loading' || status === 'stalled', [status])
  const isEmptyQuery = useMemo(() => !query || query.trim() === '', [query])
  const shouldShowEmptyState = useMemo(() => {
    if (isEmptyQuery) return true
    return results && typeof results.nbHits === 'number' && results.nbHits === 0
  }, [results, isEmptyQuery])

  console.log('🔍 NewHitsGridWithEmptyState: State values:', {
    status,
    isLoading,
    nbHits: results?.nbHits,
    hasResults: !!results,
    resultsType: typeof results,
    resultsKeys: results ? Object.keys(results) : null,
    shouldShowEmptyState,
    isEmptyQuery
  })

  // Show skeleton during loading
  if (isLoading && !isEmptyQuery) {
    console.log('🔍 NewHitsGridWithEmptyState: Showing skeleton (loading)')
    return <NewGridSkeleton />
  }

  // Show empty state when no results
  if (shouldShowEmptyState) {
    console.log('🔍 NewHitsGridWithEmptyState: Showing empty state (no results)')
    return <EmptyState />
  }

  console.log('🔍 NewHitsGridWithEmptyState: Showing results grid')
  return <NewHitsGrid />
})
