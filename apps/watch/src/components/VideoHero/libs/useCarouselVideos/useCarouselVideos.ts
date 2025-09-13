import { useQuery, useLazyQuery } from '@apollo/client'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { getLanguageIdFromLocale } from '../../../../libs/getLanguageIdFromLocale'
import {
  GET_COLLECTION_COUNTS,
  GET_ONE_CHILD_BY_INDEX,
  GET_SHORT_FILMS
} from './queries'
import {
  getPlaylistConfig,
  getDeterministicOffset,
  getRandomFromMultipleCollections,
  addToSessionPlayedIds,
  addToPersistentPlayedIds,
  isVideoAlreadyPlayed,
  isPoolExhausted,
  markPoolVideoPlayed,
  getPoolKey,
  saveCurrentVideoSession,
  loadCurrentVideoSession,
  clearCurrentVideoSession
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
  const [fetchCollectionVideo] = useLazyQuery(GET_ONE_CHILD_BY_INDEX, {
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

  // Get video for current pool
  const { data: currentVideoData, loading: currentVideoLoading } = useQuery(
    currentPool[0] === 'shortFilms' ? GET_SHORT_FILMS : GET_ONE_CHILD_BY_INDEX,
    {
      variables:
        currentPool[0] === 'shortFilms'
          ? { languageId }
          : {
              parentId: currentPool[0],
              languageId
            },
      skip:
        !countsData || currentPool[0] === 'shortFilms'
          ? !shortFilmsData
          : false,
      // Use cache-and-network for Featured collection, cache-first for others
      fetchPolicy: currentPool.includes('20_Featured')
        ? 'cache-and-network'
        : 'cache-first',
      nextFetchPolicy: 'cache-first',
      errorPolicy: 'all',
      onCompleted: (data) => {},
      onError: (error) => {}
    }
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
        const shortFilms = shortFilmsData?.videos || []
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
        // Handle regular collection
        const collectionId = pool[0]

        try {
          const { data } = await fetchCollectionVideo({
            variables: {
              parentId: collectionId,
              languageId
            }
          })

          if (data?.video?.children?.length > 0) {
            const offset = getDeterministicOffset(
              collectionId,
              data.video.children.length,
              {
                poolIndex: poolResult.index,
                totalVideosLoaded: videos.length
              }
            )
            return data.video.children[offset] || null
          }
        } catch (err) {}
      }

      return null
    },
    [shortFilmsData, fetchCollectionVideo, languageId]
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

  // Process current video from query result and add to videos array if not already present
  useEffect(() => {
    if (!currentVideoData) return
    if (videos.length > 0) return // Already have videos loaded

    let video: CarouselVideo | null = null

    if (currentPool[0] === 'shortFilms') {
      // Handle short films with deterministic daily selection
      const shortFilms = shortFilmsData?.videos || []
      if (shortFilms.length > 0) {
        const offset = getDeterministicOffset('shortFilms', shortFilms.length, {
          poolIndex: effectivePoolIndex,
          totalVideosLoaded: videos.length
        })
        video = shortFilms[offset]

        if (video) {
          markPoolVideoPlayed('shortFilms', video.id)
        }
      }
    } else if (currentVideoData.video?.children?.[0]) {
      // Handle regular collection video
      const children = currentVideoData.video.children
      const collectionId = currentPool[0]
      const childrenCount = children.length

      if (childrenCount > 0) {
        const offset = getDeterministicOffset(collectionId, childrenCount, {
          poolIndex: effectivePoolIndex,
          totalVideosLoaded: videos.length
        })
        video = children[offset]

        if (video) {
          // Mark video played for the specific collection
          markPoolVideoPlayed(collectionId, video.id)
        }
      }
    }

    if (video) {
      const videoWithPool = {
        ...video,
        poolIndex: effectivePoolIndex,
        poolId: currentPool[0]
      }

      // Add first video to the array
      setVideos([videoWithPool])
      setCurrentIndex(0)

      // Track as played
      addToSessionPlayedIds(video.id)
      addToPersistentPlayedIds(video.id)
    }
  }, [
    currentVideoData,
    currentPool,
    shortFilmsData,
    effectivePoolIndex,
    videos.length
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

  // Debug infinite playlist state
  useEffect(() => {
    if (videos.length === 0) return

    const pastVideos = videos.slice(0, currentIndex).reverse() // Past videos in reverse order (most recent first)
    const currentVideo = videos[currentIndex] || null
    const futureVideos = videos.slice(currentIndex + 1)

    console.log('🎬 INFINITE PLAYLIST DEBUG:', {
      totalVideos: videos.length,
      currentIndex,
      pastVideos: pastVideos.map((video, index) => ({
        position: -(index + 1), // Negative positions for past videos
        id: video.id,
        title: video.title[0]?.value,
        poolIndex: video.poolIndex || 'unknown',
        poolId: video.poolId || 'unknown'
      })),
      currentVideo: currentVideo
        ? {
            position: 0,
            id: currentVideo.id,
            title: currentVideo.title[0]?.value,
            poolIndex: currentVideo.poolIndex || 'unknown',
            poolId: currentVideo.poolId || 'unknown'
          }
        : null,
      futureVideos: futureVideos.map((video, index) => ({
        position: index + 1, // Positive positions for future videos
        id: video.id,
        title: video.title[0]?.value,
        poolIndex: video.poolIndex || 'unknown',
        poolId: video.poolId || 'unknown'
      })),
      carouselVideos: videos.map((video, index) => ({
        carouselPosition: index,
        id: video.id,
        title: video.title[0]?.value,
        poolIndex: video.poolIndex || 'unknown',
        poolId: video.poolId || 'unknown',
        isCurrentlyPlaying: index === currentIndex
      })),
      loading: loadingQueue.size > 0,
      loadingPositions: Array.from(loadingQueue)
    })
  }, [videos, currentIndex, loadingQueue])

  const moveToNext = useCallback(() => {
    if (currentIndex < videos.length - 1) {
      // Move to next video in the array
      setCurrentIndex((prev) => prev + 1)

      const nextVideo = videos[currentIndex + 1]
      if (nextVideo) {
        // Update pool index to match next video
        setPoolIndex(nextVideo.poolIndex || 0)

        // Track as played
        addToSessionPlayedIds(nextVideo.id)
        addToPersistentPlayedIds(nextVideo.id)
        markPoolVideoPlayed(nextVideo.poolId || 'unknown', nextVideo.id)

        console.log('➡️ MOVED TO NEXT VIDEO:', {
          newIndex: currentIndex + 1,
          videoId: nextVideo.id,
          title: nextVideo.title[0]?.value,
          poolIndex: nextVideo.poolIndex,
          totalVideos: videos.length
        })
      }
    } else if (videos.length > 0) {
      // At the end, fallback to incrementing pool index to load more videos
      setPoolIndex((prev) => prev + 1)
      console.log('📈 REACHED END, INCREMENTING POOL INDEX:', {
        currentIndex,
        videosLength: videos.length,
        newPoolIndex: poolIndex + 1
      })
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

        console.log('⬅️ MOVED TO PREVIOUS VIDEO:', {
          newIndex: currentIndex - 1,
          videoId: previousVideo.id,
          title: previousVideo.title[0]?.value,
          poolIndex: previousVideo.poolIndex,
          totalVideos: videos.length
        })
      }
    } else {
      // Already at the beginning, can't go back further
      console.log('🚫 ALREADY AT BEGINNING:', { currentIndex })
    }
  }, [currentIndex, videos])

  const jumpToVideo = useCallback(
    (videoId: string): boolean => {
      // Find video in the videos array
      const videoIndex = videos.findIndex((video) => video.id === videoId)
      if (videoIndex === -1) {
        console.warn('Video not found in videos array:', videoId)
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
      addToSessionPlayedIds(targetVideo.id)
      addToPersistentPlayedIds(targetVideo.id)
      markPoolVideoPlayed(targetVideo.poolId || 'unknown', targetVideo.id)

      console.log('🎯 JUMPED TO VIDEO:', {
        videoId: targetVideo.id,
        title: targetVideo.title[0]?.value,
        poolIndex: targetVideo.poolIndex,
        oldIndex: currentIndex,
        newIndex: videoIndex,
        totalVideos: videos.length
      })

      return true
    },
    [videos, currentIndex]
  )

  const loading = countsLoading || currentVideoLoading

  return {
    loading,
    videos,
    currentIndex,
    error,
    moveToNext,
    moveToPrevious,
    jumpToVideo,
    currentPoolIndex: poolIndex
  }
}
