"use client"

import type { Hit as AlgoliaHit } from 'instantsearch.js'
import { Hits, Pagination, SearchBox, useInstantSearch, useSearchBox } from 'react-instantsearch'
import { Card } from '@/components/ui/card'
import { Container } from '@/components/ui/container'
import { MediaCard, type MediaCardProps } from './MediaCard'
import { Skeleton } from '@/components/ui/skeleton'
import { AspectRatio } from '@/components/ui/aspect-ratio'

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

function SearchBoxWithLoading() {
  const { status } = useInstantSearch()
  const isSearching = status === 'loading' || status === 'stalled'

  return (
    <div className="relative max-w-2xl mx-auto">
      <SearchBox
        classNames={{
          root: 'w-full',
          input: 'h-14 w-full rounded-lg border border-gray-300 bg-white px-6 py-4 text-base text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-colors shadow-sm hover:shadow-md'
        }}
        placeholder="Search videos, films, and series..."
      />
      {isSearching && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2" aria-hidden="true">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  const { clear } = useSearchBox()

  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-6xl">🔍</div>
      <h3 className="text-xl font-semibold text-foreground mb-2">No videos found</h3>
      <p className="text-muted-foreground max-w-md">
        We couldn't find any videos matching your search. Try adjusting your search terms or browse our full collection.
      </p>
      <div className="mt-6">
        <button
          onClick={() => {
            clear()
          }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-colors"
          aria-label="Clear search and show all videos"
        >
          Clear Search
        </button>
      </div>
    </div>
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

export function VideoGrid() {
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

        <div className="mt-8 flex justify-center">
          <Pagination
            classNames={{
              root: 'flex items-center gap-2',
              selectedItem: 'font-semibold'
            }}
          />
        </div>
      </Container>
    </section>
  )
}

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
function NewHitsGridWithEmptyState() {
  const { results, status } = useInstantSearch()
  const isLoading = status === 'loading' || status === 'stalled'

  // Show skeleton during loading
  if (isLoading) {
    return <NewGridSkeleton />
  }

  // Show empty state when no results
  if (results && results.nbHits === 0) {
    return <EmptyState />
  }

  return <NewHitsGrid />
}


