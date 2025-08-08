'use client'

import { useQuery } from '@apollo/client'
import { Clock, Play } from 'lucide-react'
import type { KeyboardEvent, ReactElement, ReactNode } from 'react'

import { GET_COLLECTION_CHILDREN } from '@/libs/queries/films'
import { getVideoUrl } from '@/libs/utils/getVideoUrl'

interface CloudflareImage {
  mobileCinematicHigh: string
}

interface VideoGridItem {
  id: string
  title: string
  subtitle?: string
  durationSeconds: number
  image?: string
}

interface GraphQLVideo {
  id: string
  label: string
  images: CloudflareImage[]
  imageAlt: {
    value: string
  }[]
  snippet: {
    value: string
  }[]
  description: {
    value: string
  }[]
  title: {
    value: string
  }[]
  variant: {
    id: string
    duration: number
    language: {
      id: string
      name: {
        value: string
        primary: boolean
      }
      bcp47: string
    }
    slug: string
  }
  variantLanguagesCount: number
  slug: string
  published: boolean
  children?: GraphQLVideo[]
  childrenCount?: number
}

interface GetCollectionChildrenData {
  video: GraphQLVideo
}

interface GetCollectionChildrenVars {
  collectionId: string
  languageId: string
}

export interface VideoGridSectionProps {
  isLoading?: boolean
  showNumbering?: boolean
  sectionTitle?: string
  headingText?: string
  description?: string
  customDescription?: ReactNode // Custom description text to render
  collectionId?: string
}

const hardcodedItems: VideoGridItem[] = Array.from({ length: 10 }).map((_, index) => ({
  id: `item-${index + 1}`,
  title: `Video ${index + 1}: Journey of Faith`,
  durationSeconds: 8 * 60 + 30
}))



function formatDurationShort(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const paddedSeconds = seconds.toString().padStart(2, '0')
  return `${minutes}:${paddedSeconds}`
}

export function VideoGridSection(props: VideoGridSectionProps): ReactElement {
  const {
    isLoading = false,
    showNumbering = false,
    sectionTitle: customSectionTitle,
    headingText: customHeadingText,
    description: customDescription,
    customDescription: customDescriptionText,
    collectionId
  } = props

  // GraphQL query for collection videos with improved error handling and language support
  const { data: collectionData, loading: collectionLoading, error: collectionError } = useQuery<
    GetCollectionChildrenData,
    GetCollectionChildrenVars
  >(GET_COLLECTION_CHILDREN, {
    variables: {
      collectionId: collectionId || '',
      languageId: '529' // TODO: Replace with dynamic user language preference
    },
    skip: !collectionId,
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: false,
    fetchPolicy: 'cache-and-network'
  })

  // Enhanced error handling with logging
  if (collectionError) {
    console.error('Collection query error:', collectionError)
    // Fall back to hardcoded data instead of showing error UI
    return (
      <section className="min-h-[60vh] bg-slate-950 py-16 text-white relative">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-20 py-8 relative z-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Unable to Load Collection</h2>
            <p className="text-stone-200/80 mb-6">There was an error loading the video collection. Showing default content instead.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-white text-slate-900 hover:bg-blue-50 px-6 py-3 rounded-full font-semibold tracking-wide transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    )
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }
    event.preventDefault()
    // No navigation in Basic slice; reserved for future improvements
  }

  // Transform GraphQL data to VideoGridItem format
  const transformGraphQLVideos = (videos: GraphQLVideo[]): VideoGridItem[] => {
    return videos.map((video, index) => {
      const firstImage = video.images?.[0]
      const imageUrl = firstImage?.mobileCinematicHigh || '/placeholder-image.jpg'
      const videoTitle = video.title?.[0]?.value || 'Video'
      const videoSubtitle = video.snippet?.[0]?.value || video.description?.[0]?.value || ''
      
      return {
        id: video.id,
        title: videoTitle,
        subtitle: videoSubtitle,
        durationSeconds: video.variant?.duration || 0,
        image: imageUrl
      }
    })
  }

  // Determine which data to use - require collectionId for data
  let items: VideoGridItem[]
  let isDataLoading = isLoading

  if (collectionId && collectionData?.video?.children) {
    items = transformGraphQLVideos(collectionData.video.children)
    isDataLoading = collectionLoading
  } else if (collectionId && collectionLoading && !collectionData) {
    // Initial loading state when no data yet
    items = []
    isDataLoading = true
  } else {
    // No collectionId provided - show empty state
    items = []
    isDataLoading = false
  }

  const sectionTitle = customSectionTitle || 'FEATURED VIDEOS'
  const headingText = customHeadingText || 'Explore the Video Library'
  
  // Use customDescription if provided, otherwise use parent video description from GraphQL
  const description = customDescription || (collectionData?.video?.description?.[0]?.value || '')

  return (
    <section className="min-h-[60vh] bg-slate-950 py-16 text-white relative">
      {/* Background Image - Bottom Layer */}
      {collectionData?.video?.images?.[0]?.mobileCinematicHigh && (
        <div
          className="absolute left-0 right-0 top-0 w-full aspect-[32/15] opacity-60"
          style={{
            backgroundImage: `url("${collectionData.video.images[0].mobileCinematicHigh}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            mask: 'linear-gradient(to bottom, white 0%, white 50%, transparent 100%)',
            WebkitMask: 'linear-gradient(to bottom, white 0%, white 50%, transparent 100%)',
          }}
        />
      )}

      {/* Gradient Overlay - Middle Layer */}
      <div className="absolute inset-0 bg-gradient-to-tr from-red-950/40 via-orange-750/30 to-yellow-550/10" />

                          {/* Texture Overlay - Top Layer */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'url("/overlay.svg")',
              // backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'repeat',
            }}
          />

      <div className="max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-20 py-8 relative z-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-stone-200/80 text-sm tracking-[0.3em] uppercase mb-4">{sectionTitle}</p>
            <h2 className="text-2xl sm:text-3xl xl:text-4xl font-bold leading-tight text-white">
              {headingText}
            </h2>
            {description && (
              <p className="text-stone-100/90 text-lg sm:text-xl leading-relaxed max-w-3xl text-[rgba(255,255,255,0.9)]">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            aria-label="see all videos"
            className="justify-center whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-6 rounded-full font-semibold tracking-wide transition-all duration-200 bg-white/10 hover:bg-white/20 border border-white/20 text-white hidden sm:inline-flex"
          >
            SEE ALL
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isDataLoading
            ? Array.from({ length: 10 }).map((_, index) => (
                <div key={`skeleton-${index}`} className="group cursor-pointer">
                  {/* Video Thumbnail Skeleton */}
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-slate-800 shadow-2xl animate-pulse">
                    <div className="w-full h-full bg-slate-700" />
                    {/* Episode Number Skeleton */}
                    {showNumbering && (
                      <div className="absolute top-2 left-2 w-10 h-10 bg-slate-700 rounded-full animate-pulse" />
                    )}
                    {/* Play Overlay Skeleton */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 border border-white/30">
                        <div className="w-8 h-8 bg-slate-700 rounded-full animate-pulse" />
                      </div>
                    </div>
                  </div>
                  {/* Video Info Skeleton */}
                  <div className="px-1">
                    {showNumbering && (
                      <div className="h-4 w-16 bg-slate-700 rounded animate-pulse mb-2" data-testid="item-loading-skeleton" />
                    )}
                    <div className="h-6 w-3/4 bg-slate-700 rounded animate-pulse mb-2" data-testid="item-loading-skeleton" />
                    <div className="h-4 w-1/3 bg-slate-700 rounded animate-pulse" data-testid="item-loading-skeleton" />
                  </div>
                </div>
              ))
            : items.map((item, index) => {
                const numbering = showNumbering ? `Item ${index + 1}` : ''
                const aria = numbering ? `${numbering}: ${item.title}` : item.title
                
                return (
                  <div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    aria-label={aria}
                    className="group cursor-pointer"
                    onClick={() => window.location.href = getVideoUrl(item.id)}
                    onKeyDown={handleKeyDown}
                  >
                    {/* Video Thumbnail */}
                    <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-slate-800 shadow-2xl hover:shadow-3xl transition-all duration-300">
                      <img
                        src={item.image || '/placeholder-image.jpg'}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 border border-white/30">
                          <Play className="w-8 h-8 text-white fill-white" />
                        </div>
                      </div>
                      {/* Opacity Gradient Overlay for Episode Number */}
                      {showNumbering && (
                        <>
                          <div
                            className="absolute top-0 left-0 w-32 h-24 backdrop-blur-sm"
                            style={{
                              background:
                                'radial-gradient(ellipse at top left, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 40%, transparent 70%)',
                              mask: 'radial-gradient(ellipse at top left, white 0%, rgba(255,255,255,0.8) 30%, rgba(255,255,255,0.4) 60%, transparent 100%)',
                              WebkitMask:
                                'radial-gradient(ellipse at top left, white 0%, rgba(255,255,255,0.8) 30%, rgba(255,255,255,0.4) 60%, transparent 100%)',
                            }}
                          />

                          {/* Episode Number Badge */}
                          <div
                            className="absolute top-2 left-2 text-2xl sm:text-3xl lg:text-[48px] font-bold leading-none text-white"
                            data-number={index + 1}
                            style={{
                              mixBlendMode: 'overlay',
                              textShadow:
                                '0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.4)',
                              mask: 'linear-gradient(to bottom, orange-200 50%, rgba(255,255,255,0.7) 70%, rgba(255,255,255,0.5) 100%)',
                              WebkitMask:
                                'linear-gradient(to bottom, orange-200 50%, rgba(255,255,255,0.7) 70%, rgba(255,255,255,0.5) 100%)',
                            }}
                          >
                            {index + 1}
                          </div>
                        </>
                      )}
                      {/* Duration Badge */}
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                        {formatDurationShort(item.durationSeconds)}
                      </div>
                    </div>
                    
                    {/* Video Info */}
                    <div className="px-1">
                      {showNumbering ? (
                        <div className="text-xs uppercase tracking-widest text-stone-300/80 mb-2">{numbering}</div>
                      ) : null}
                      <h3 className="text-white text-lg font-semibold leading-snug mb-1">{item.title}</h3>
                      {item.subtitle && (
                        <p className="text-stone-300/80 text-sm leading-relaxed">{item.subtitle}</p>
                      )}
                    </div>
                  </div>
                )
              })}
        </div>

        <div className="mt-6 sm:hidden">
          <button
            type="button"
            aria-label="see all videos"
            className="w-full justify-center whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-6 rounded-full font-semibold tracking-wide transition-all duration-200 bg-white/10 hover:bg-white/20 border border-white/20 text-white"
          >
            SEE ALL
          </button>
        </div>

        {/* Custom description text */}
        {customDescriptionText && (
          <div className="max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-20 relative z-10 mb-12">
            <p className="text-base sm:text-lg xl:text-xl mt-4 leading-relaxed text-stone-200/80 text-[20px]">
              {customDescriptionText}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

