"use client"

import type { Hit as AlgoliaHit } from 'instantsearch.js'
import { Highlight, Hits, Pagination, SearchBox, useInstantSearch, useSearchBox } from 'react-instantsearch'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Container } from '@/components/ui/container'
import { Skeleton } from '@/components/ui/skeleton'

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

type VideoHit = AlgoliaHit<{
  title: string
  description?: string
  image?: string
  videoType?: 'Feature Film' | 'Chapter' | 'Collection' | 'Documentary'
  duration?: string
  chapterCount?: number
}>

function transformAlgoliaVideo(hit: AlgoliaVideo): VideoHit {
  // Get title from titlesWithLanguages or fallback to titles
  let title = ''
  if (hit.titlesWithLanguages && hit.titlesWithLanguages.length > 0) {
    title = hit.titlesWithLanguages[0].value
  } else if (hit.titles && hit.titles.length > 0) {
    title = hit.titles[0]
  }

  // Get description
  const description = hit.description && hit.description.length > 0 ? hit.description[0] : ''

  // Convert duration from seconds to MM:SS format
  const duration = hit.duration ? `${Math.floor(hit.duration / 60)}:${(hit.duration % 60).toString().padStart(2, '0')}` : undefined

  // Map label to videoType
  let videoType: VideoHit['videoType']
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

  return {
    ...hit,
    title,
    description,
    image: hit.image,
    videoType,
    duration,
    chapterCount: hit.childrenCount > 1 ? hit.childrenCount : undefined
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

function VideoCardSkeleton() {
  return (
    <Card>
      <div className="aspect-video">
        <Skeleton className="h-full w-full" />
      </div>
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </CardContent>
    </Card>
  )
}

function Hit({ hit }: { hit: AlgoliaVideo }) {
  const videoHit = transformAlgoliaVideo(hit)
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02] focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background">
      <div className="relative aspect-video overflow-hidden bg-muted">
        {videoHit.image ? (
          <img
            src={videoHit.image}
            alt={videoHit.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <div className="text-center text-muted-foreground">
              <div className="mb-2 text-4xl">🎬</div>
              <div className="text-sm">Video</div>
            </div>
          </div>
        )}

        {/* Video type indicator */}
        {videoHit.videoType && (
          <div className="absolute top-2 left-2 rounded bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
            {videoHit.videoType}
          </div>
        )}

        {/* Duration */}
        {videoHit.duration && (
          <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
            {videoHit.duration}
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-2 text-lg font-semibold leading-tight">
          <Highlight attribute="titles" hit={hit} />
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="line-clamp-3 text-sm text-muted-foreground">
          <Highlight attribute="description" hit={hit} />
        </p>

        {/* Chapter count */}
        {videoHit.chapterCount && videoHit.chapterCount > 1 && (
          <div className="mt-2 text-xs text-muted-foreground">
            {videoHit.chapterCount} chapters
          </div>
        )}
      </CardContent>
    </Card>
  )
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


          <Hits
            hitComponent={Hit}
            classNames={{
              list: 'contents grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6',
              item: 'w-full'
            }}
            emptyComponent={() => <EmptyState />}
          />


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
