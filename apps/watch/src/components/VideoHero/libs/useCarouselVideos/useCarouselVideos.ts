import { useLazyQuery, useQuery } from '@apollo/client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { getLanguageIdFromLocale } from '../../../../libs/getLanguageIdFromLocale'
import type { VideoCarouselSlide } from '../../../../types/inserts'

import { mergeMuxInserts } from './insertMux'
import {
  GET_CAROUSEL_VIDEO_CHILDREN,
  GET_COLLECTION_COUNTS,
  GET_SHORT_FILMS
} from './queries'
import {
  addToPersistentPlayedIds,
  clearCurrentVideoSession,
  filterOutBlacklistedVideos,
  getDeterministicOffset,
  getPlaylistConfig,
  getPoolKey,
  getRandomFromMultipleCollections,
  isPoolExhausted,
  isVideoAlreadyPlayed,
  loadCurrentVideoSession,
  markPoolVideoPlayed,
  saveCurrentVideoSession
} from './utils'

export interface CarouselVideo {
  id: string
  slug: string
  title: { value: string }[]
  images: {
    mobileCinematicHigh: string | null
  }[]
  imageAlt: {
    value: string
  }[]
  label: string
  variant?: {
    id: string
    duration: number
    hls: string
    slug: string
  }
  childrenCount: number
  poolIndex?: number
  poolId?: string
  isCurrentlyPlaying?: boolean
}

export interface QueuedVideo extends CarouselVideo {
  poolIndex: number
  poolId: string
  isLoaded: boolean
}

export interface UseCarouselVideosReturn {
  loading: boolean
  slides: VideoCarouselSlide[]
  videos: CarouselVideo[] // All videos in natural sequence order
  currentIndex: number
  error: Error | null
  moveToNext: () => void
  moveToPrevious: () => void
  jumpToVideo: (videoId: string) => boolean
  currentPoolIndex: number
}

export function useCarouselVideos(locale?: string): UseCarouselVideosReturn {
  // Initialize from session storage if available
  const [videos, setVideos] = useState<CarouselVideo[]>([])
  const [currentIndex, setCurrentIndex] = useState(() => {
    const sessionState = loadCurrentVideoSession()
    if (sessionState) {
      return 0 // Start at beginning, we'll restore the actual video when we load it
    }
    return 0
  })
  const [poolIndex, setPoolIndex] = useState(() => {
    const sessionState = loadCurrentVideoSession()
    return sessionState?.poolIndex ?? 0
  })
  const [loadingQueue, setLoadingQueue] = useState<Set<number>>(new Set())
  const [error, setError] = useState<Error | null>(null)

  const config = getPlaylistConfig()
  const blacklistedVideoIds = useMemo(
    () => new Set(config.blacklistedVideoIds),
    [config.blacklistedVideoIds]
  )
  const languageId = getLanguageIdFromLocale(locale)

  // Reset pool exhaustion every 50 videos to ensure infinite cycling
  useEffect(() => {
    const shouldReset = videos.length > 0 && videos.length % 50 === 0
    if (shouldReset) {
      // Clear localStorage played videos to reset exhaustion
      try {
        localStorage.removeItem('carousel-played-ids')
      } catch (e) {}
      // Reset session played videos
      if (typeof window !== 'undefined' && (window as any).__sessionPlayedIds) {
        ;(window as any).__sessionPlayedIds = new Set()
      }
    }
  }, [videos.length])

  // Lazy queries for progressive video loading
  const [fetchCollectionVideo] = useLazyQuery(GET_CAROUSEL_VIDEO_CHILDREN, {
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
    errorPolicy: 'all'
  })

  // Get all collection IDs for counts query
  const allCollectionIds = useMemo(() => {
    const ids = new Set<string>()
    config.playlistSequence.forEach((pool) => {
      pool.forEach((id) => ids.add(id))
    })
    return Array.from(ids)
  }, [config])

  // Fetch collection counts - cached for 24h as per requirement
  const { data: countsData, loading: countsLoading } = useQuery(
    GET_COLLECTION_COUNTS,
    {
      variables: { ids: allCollectionIds, languageId },
      fetchPolicy: 'cache-first',
      nextFetchPolicy: 'cache-first',
      errorPolicy: 'all',
      onCompleted: (data) => {},
      onError: (error) => {}
    }
  )

  // Get short films - stable pool, cache aggressively
  const { data: shortFilmsData } = useQuery(GET_SHORT_FILMS, {
    variables: { languageId },
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
    errorPolicy: 'all',
    onCompleted: (data) => {},
    onError: (error) => {}
  })

  // Find next available pool - skip exhausted ones
  const findNextAvailablePool = useCallback(
    (startIndex: number): { pool: string[]; index: number } | null => {
      const sequenceLength = config.playlistSequence.length
      const maxAttempts = (sequenceLength + 1) * 3 // Try more cycles for infinite loading

      for (let i = 0; i < maxAttempts; i++) {
        const testIndex = startIndex + i
        const positionInCycle = testIndex % (sequenceLength + 1)

        let testPool: string[]

        if (positionInCycle === sequenceLength) {
          testPool = ['shortFilms']
        } else {
          testPool = config.playlistSequence[positionInCycle]
        }

        // Check if this pool is exhausted
        if (testPool[0] === 'shortFilms') {
          const shortFilmsCount = shortFilmsData?.videos?.length || 0
          const exhausted = isPoolExhausted('shortFilms', shortFilmsCount)

          if (shortFilmsCount > 0 && !exhausted) {
            return { pool: testPool, index: testIndex }
          }
        } else {
          // Check if any collection in this pool has available videos
          const poolStatus = testPool.map((collectionId) => {
            const collection = countsData?.videos?.find(
              (n: any) => n.id === collectionId
            )
            const childrenCount = collection?.childrenCount || 0
            const exhausted = isPoolExhausted(collectionId, childrenCount)
            return {
              collectionId,
              childrenCount,
              exhausted,
              available: childrenCount > 0 && !exhausted
            }
          })

          const hasAvailable = poolStatus.some((status) => status.available)

          if (hasAvailable) {
            return { pool: testPool, index: testIndex }
          }
        }
      }

      return null
    },
    [config.playlistSequence, countsData, shortFilmsData]
  )

  // Current pool with exhaustion checking and shortFilms injection
  const { currentPool, effectivePoolIndex } = useMemo(() => {
    const sequenceLength = config.playlistSequence.length

    if (!countsData) {
      // During loading, calculate position including shortFilms injection
      const positionInCycle = poolIndex % (sequenceLength + 1)

      if (positionInCycle === sequenceLength) {
        return { currentPool: ['shortFilms'], effectivePoolIndex: poolIndex }
      }
      return {
        currentPool: config.playlistSequence[positionInCycle],
        effectivePoolIndex: poolIndex
      }
    }

    const result = findNextAvailablePool(poolIndex)

    if (result) {
      // Update poolIndex if we skipped some pools
      if (result.index !== poolIndex) {
        setTimeout(() => setPoolIndex(result.index), 0)
      }
      return { currentPool: result.pool, effectivePoolIndex: result.index }
    }

    // Fallback to first pool if all are exhausted
    return {
      currentPool: config.playlistSequence[0],
      effectivePoolIndex: poolIndex
    }
  }, [poolIndex, config.playlistSequence, countsData, findNextAvailablePool])

  // Helper to recursively find a playable video within a collection tree
  const findVideoInCollection = useCallback(
    async (collectionId: string, depth = 0): Promise<CarouselVideo | null> => {
      if (depth > 3) return null

      try {
        const { data } = await fetchCollectionVideo({
          variables: { parentId: collectionId, languageId }
        })

        const children = data?.video?.children || []
        const videoChildren = filterOutBlacklistedVideos(
          children.filter((c: any) => c.variant && c.variant.hls),
          blacklistedVideoIds
        ).filter((video: any) => !isVideoAlreadyPlayed(video.id))
        if (videoChildren.length > 0) {
          const offset = getDeterministicOffset(
            collectionId,
            videoChildren.length,
            {
              poolIndex,
              totalVideosLoaded: videos.length
            }
          )
          return videoChildren[offset] || null
        }

        const collectionChildren = children.filter(
          (c: any) => !c.variant && c.childrenCount > 0
        )

        if (collectionChildren.length > 0) {
          const { collectionId: nextId } = getRandomFromMultipleCollections(
            collectionChildren.map((c: any) => ({
              id: c.id,
              childrenCount: c.childrenCount
            })),
            collectionId + depth
          )
          return findVideoInCollection(nextId, depth + 1)
        }
      } catch (err) {}

      return null
    },
    [
      fetchCollectionVideo,
      languageId,
      poolIndex,
      videos.length,
      getRandomFromMultipleCollections,
      blacklistedVideoIds
    ]
  )

  // Load video from a specific pool
  const loadVideoFromPool = useCallback(
    async (poolResult: {
      pool: string[]
      index: number
    }): Promise<CarouselVideo | null> => {
      const { pool, index } = poolResult

      if (pool[0] === 'shortFilms') {
        // Handle short films
        const shortFilms = filterOutBlacklistedVideos(
          (shortFilmsData?.videos || []).filter((v: any) => v.variant && v.variant.hls),
          blacklistedVideoIds
        ).filter((video: any) => !isVideoAlreadyPlayed(video.id))
        if (shortFilms.length > 0) {
          const offset = getDeterministicOffset(
            'shortFilms',
            shortFilms.length,
            {
              poolIndex: poolResult.index,
              totalVideosLoaded: videos.length
            }
          )
          return shortFilms[offset] || null
        }
      } else {
        // Handle regular collections (including nested)
        const availableCollections = pool
          .map((collectionId) => {
            const collection = countsData?.videos?.find(
              (n: any) => n.id === collectionId
            )
            const childrenCount = collection?.childrenCount || 0
            const exhausted = isPoolExhausted(collectionId, childrenCount)
            return {
              id: collectionId,
              childrenCount,
              exhausted
            }
          })
          .filter((c) => c.childrenCount > 0 && !c.exhausted)

        if (availableCollections.length === 0) return null

        const { collectionId } = getRandomFromMultipleCollections(
          availableCollections,
          `pool-${index}`
        )

        const video = await findVideoInCollection(collectionId)
        if (!video) {
          // Track consecutive failures for this collection to detect persistent depletion
          const failureKey = `pool-${collectionId}-failures`
          const currentFailures = parseInt(sessionStorage.getItem(failureKey) || '0', 10)
          const newFailureCount = currentFailures + 1
          sessionStorage.setItem(failureKey, newFailureCount.toString())

          // If this collection has failed 3 times in a row, mark the entire pool as exhausted
          if (newFailureCount >= 3) {
            const childrenCount = countsData?.videos?.find(
              (n: any) => n.id === collectionId
            )?.childrenCount || 0
            // Mark as exhausted by setting played videos equal to total count
            const poolVideosKey = `pool-${collectionId}-videos`
            const playedVideos = JSON.parse(sessionStorage.getItem(poolVideosKey) || '[]')
            // Fill the played videos array to reach exhaustion threshold
            for (let i = playedVideos.length; i < childrenCount; i++) {
              playedVideos.push(`exhausted-${i}`)
            }
            sessionStorage.setItem(poolVideosKey, JSON.stringify(playedVideos))
          } else {
            // mark attempt to avoid infinite retries
            markPoolVideoPlayed(collectionId)
          }
          return null
        }

        // Reset failure counter on successful video retrieval
        const failureKey = `pool-${collectionId}-failures`
        sessionStorage.removeItem(failureKey)

        return video
      }

      return null
    },
    [
      shortFilmsData,
      countsData,
      findVideoInCollection,
      getRandomFromMultipleCollections,
      languageId,
      blacklistedVideoIds
    ]
  )

  // Progressive video loading for infinite playlist
  const loadNextVideo = useCallback(async () => {
    // New prefetch logic: 7 on initial load, 1 ahead during playback
    const initialPrefetchTarget = 7
    const playbackPrefetchTarget = 1
    const isInitialLoad = videos.length < initialPrefetchTarget
    const videosAhead = videos.length - currentIndex - 1
    const prefetchTarget = isInitialLoad
      ? initialPrefetchTarget
      : playbackPrefetchTarget

    if (loadingQueue.size >= 1) {
      return // Only load one at a time
    }
    if (videosAhead >= prefetchTarget) {
      return // Max videos ahead based on new logic
    }

    const nextVideoPosition = videos.length

    // Find starting search index: after the last video's pool index, or after current video if no videos yet
    let searchStartIndex: number
    if (videos.length > 0) {
      // Start searching after the highest pool index in the videos array
      const highestPoolIndex = Math.max(...videos.map((v) => v.poolIndex || 0))
      searchStartIndex = highestPoolIndex + 1

      // If we have multiple videos from the same pool recently, skip ahead more to force diversity
      const recentVideos = videos.slice(-5) // Last 5 videos
      const recentPoolCounts = recentVideos.reduce(
        (acc, video) => {
          const poolId = video.poolId || 'unknown'
          acc[poolId] = (acc[poolId] || 0) + 1
          return acc
        },
        {} as Record<string, number>
      )

      const mostUsedPool = Object.keys(recentPoolCounts).find(
        (poolId) => recentPoolCounts[poolId] >= 3
      )
      if (mostUsedPool) {
        searchStartIndex += 10 // Skip ahead more to avoid cycling back to overused pools
      }
    } else {
      // No videos yet, start after current pool
      searchStartIndex = effectivePoolIndex + 1
    }

    // Get next available pool in infinite sequence (allows cycling)
    const nextPool = findNextAvailablePool(searchStartIndex)

    if (!nextPool) {
      return
    }

    setLoadingQueue((prev) => new Set(prev).add(nextVideoPosition))

    try {
      const video = await loadVideoFromPool(nextPool)

      if (video) {
        const videoWithPool = {
          ...video,
          poolIndex: nextPool.index,
          poolId: nextPool.pool[0]
        }

        const isFirst = videos.length === 0

        // Check for duplicates before adding to videos array
        setVideos((prev) => {
          // Check if we already have this video ID (allow same pool index for cycling)
          const hasDuplicate = prev.some(
            (existingVideo) => existingVideo.id === videoWithPool.id
          )

          if (hasDuplicate) {
            // If we hit a duplicate, we might be stuck in a small pool
            // Mark this pool as temporarily exhausted to force trying other pools
            if (videoWithPool.poolId) {
              markPoolVideoPlayed(videoWithPool.poolId, videoWithPool.id)
            }

            return prev
          }

          return [...prev, videoWithPool]
        })

        if (isFirst) {
          addToPersistentPlayedIds(videoWithPool.id)
          markPoolVideoPlayed(
            videoWithPool.poolId || 'unknown',
            videoWithPool.id
          )
        }
      }
    } catch (err) {
    } finally {
      setLoadingQueue((prev) => {
        const newSet = new Set(prev)
        newSet.delete(nextVideoPosition)
        return newSet
      })
    }
  }, [
    videos,
    currentIndex,
    effectivePoolIndex,
    findNextAvailablePool,
    loadVideoFromPool,
    loadingQueue.size
  ])

  // Save current video session whenever current video changes
  useEffect(() => {
    if (videos.length > 0 && currentIndex >= 0 && videos[currentIndex]) {
      const currentVideo = videos[currentIndex]
      const videoTitle = currentVideo.title[0]?.value || 'Unknown Video'
      const poolId = currentVideo.poolId || 'unknown'

      saveCurrentVideoSession(
        currentVideo.id,
        currentVideo.slug,
        videoTitle,
        currentVideo.poolIndex || 0,
        poolId
      )
    }
  }, [videos, currentIndex])

  // Clear session on unmount
  useEffect(() => {
    return () => {
      // Don't clear session on unmount - we want it to persist
      // Only clear on explicit user action or expiry
    }
  }, [])

  // Load first video when data is ready
  useEffect(() => {
    if (!countsData || videos.length > 0) return
    loadNextVideo()
  }, [countsData, videos.length, loadNextVideo])

  // Start progressive loading after first video is set
  useEffect(() => {
    if (videos.length === 0 || !countsData) return
    loadNextVideo()
  }, [videos.length, countsData, loadNextVideo])

  // Continue loading next videos to maintain prefetch count
  useEffect(() => {
    const initialPrefetchTarget = 7
    const playbackPrefetchTarget = 1
    const isInitialLoad = videos.length < initialPrefetchTarget
    const videosAhead = videos.length - currentIndex - 1
    const prefetchTarget = isInitialLoad
      ? initialPrefetchTarget
      : playbackPrefetchTarget

    const shouldLoad =
      videos.length > 0 &&
      videosAhead < prefetchTarget &&
      loadingQueue.size === 0

    if (shouldLoad) {
      loadNextVideo()
    }
  }, [videos.length, currentIndex, loadingQueue.size, loadNextVideo])

  const moveToNext = useCallback(() => {
    if (currentIndex < videos.length - 1) {
      // Move to next video in the array
      setCurrentIndex((prev) => prev + 1)

      const nextVideo = videos[currentIndex + 1]
      if (nextVideo) {
        // Update pool index to match next video
        setPoolIndex(nextVideo.poolIndex || 0)

        // Track as played
        addToPersistentPlayedIds(nextVideo.id)
        markPoolVideoPlayed(nextVideo.poolId || 'unknown', nextVideo.id)
      }
    } else if (videos.length > 0) {
      // At the end, fallback to incrementing pool index to load more videos
      setPoolIndex((prev) => prev + 1)
    }
  }, [currentIndex, videos, poolIndex])

  const moveToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      // Move to previous video in the array
      setCurrentIndex((prev) => prev - 1)

      const previousVideo = videos[currentIndex - 1]
      if (previousVideo) {
        // Update pool index to match previous video
        setPoolIndex(previousVideo.poolIndex || 0)
      }
    } else {
      // Already at the beginning, can't go back further
    }
  }, [currentIndex, videos])

  const slides = useMemo(() => mergeMuxInserts(videos), [videos])

  const jumpToVideo = useCallback(
    (videoId: string): boolean => {
      // Find slide in the slides array
      const slideIndex = slides.findIndex(
        (slide) => slide.id === videoId
      )
      if (slideIndex === -1) {
        return false
      }

      const targetSlide = slides[slideIndex]

      // For mux slides, we don't need to update the video index since they don't correspond to videos
      if (targetSlide.source === 'mux') {
        // Handle mux insert selection
        // Note: Mux inserts are not tracked the same way as videos
        return true
      }

      // For video slides, find the corresponding video index
      const videoIndex = videos.findIndex((video) => video.id === videoId)
      if (videoIndex === -1) {
        return false
      }

      // Check if trying to jump to current video
      if (currentIndex === videoIndex) {
        return true // Already playing this video
      }

      const targetVideo = videos[videoIndex]

      // Jump to the target video
      setCurrentIndex(videoIndex)
      setPoolIndex(targetVideo.poolIndex || 0)

      // Track as played
      addToPersistentPlayedIds(targetVideo.id)
      markPoolVideoPlayed(targetVideo.poolId || 'unknown', targetVideo.id)

      return true
    },
    [slides, videos, currentIndex]
  )

  const loading = countsLoading

  return {
    loading,
    slides,
    videos,
    currentIndex,
    error,
    moveToNext,
    moveToPrevious,
    jumpToVideo,
    currentPoolIndex: poolIndex
  }
}
