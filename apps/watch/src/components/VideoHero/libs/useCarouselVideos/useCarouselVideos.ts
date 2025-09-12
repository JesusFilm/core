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
  getPoolKey
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
}

export interface QueuedVideo extends CarouselVideo {
  poolIndex: number
  poolId: string
  isLoaded: boolean
}

export interface UseCarouselVideosReturn {
  loading: boolean
  currentVideo: CarouselVideo | null
  nextVideos: CarouselVideo[]
  videoQueue: QueuedVideo[]
  error: Error | null
  moveToNext: () => void
  moveToPrevious: () => void
  currentPoolIndex: number
}

export function useCarouselVideos(locale?: string): UseCarouselVideosReturn {
  const [poolIndex, setPoolIndex] = useState(0)
  const [currentVideo, setCurrentVideo] = useState<CarouselVideo | null>(null)
  const [videoQueue, setVideoQueue] = useState<QueuedVideo[]>([])
  const [loadingQueue, setLoadingQueue] = useState<Set<number>>(new Set())
  const [error, setError] = useState<Error | null>(null)

  const config = getPlaylistConfig()
  const languageId = getLanguageIdFromLocale(locale)

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
      onCompleted: (data) => {
        console.log('📊 PLAYLIST SEQUENCE GraphQL Response:', {
          query: 'GET_COLLECTION_COUNTS',
          requestedIds: allCollectionIds,
          languageId,
          responseData: data,
          collectionsFound: data?.videos?.length || 0,
          collections:
            data?.videos?.map((video: any) => ({
              id: video.id,
              childrenCount: video.childrenCount,
              title: video.title?.value,
              label: video.label
            })) || []
        })
      },
      onError: (error) => {
        console.error('❌ PLAYLIST SEQUENCE GraphQL Error:', {
          query: 'GET_COLLECTION_COUNTS',
          requestedIds: allCollectionIds,
          languageId,
          error: error.message,
          graphQLErrors: error.graphQLErrors,
          networkError: error.networkError
        })
      }
    }
  )

  // Get short films - stable pool, cache aggressively
  const { data: shortFilmsData } = useQuery(GET_SHORT_FILMS, {
    variables: { languageId },
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
    errorPolicy: 'all',
    onCompleted: (data) => {
      console.log('🎬 SHORT FILMS GraphQL Response:', {
        query: 'GET_SHORT_FILMS',
        languageId,
        responseData: data,
        shortFilmsFound: data?.videos?.length || 0,
        shortFilms:
          data?.videos?.slice(0, 3).map((video: any) => ({
            id: video.id,
            title: video.title?.[0]?.value,
            label: video.label
          })) || []
      })
    },
    onError: (error) => {
      console.error('❌ SHORT FILMS GraphQL Error:', {
        query: 'GET_SHORT_FILMS',
        languageId,
        error: error.message
      })
    }
  })

  // Find next available pool - skip exhausted ones
  const findNextAvailablePool = useCallback(
    (startIndex: number): { pool: string[]; index: number } | null => {
      const sequenceLength = config.playlistSequence.length
      const maxAttempts = (sequenceLength + 1) * 2 // Try two full cycles

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
          if (
            shortFilmsCount > 0 &&
            !isPoolExhausted('shortFilms', shortFilmsCount)
          ) {
            return { pool: testPool, index: testIndex }
          }
        } else {
          // Check if any collection in this pool has available videos
          const hasAvailable = testPool.some((collectionId) => {
            const collection = countsData?.videos?.find(
              (n: any) => n.id === collectionId
            )
            const childrenCount = collection?.childrenCount || 0
            return (
              childrenCount > 0 && !isPoolExhausted(collectionId, childrenCount)
            )
          })

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
      onCompleted: (data) => {
        if (currentPool[0] !== 'shortFilms') {
          console.log('📺 CURRENT VIDEO GraphQL Response:', {
            query: 'GET_ONE_CHILD_BY_INDEX',
            parentId: currentPool[0],
            languageId,
            responseData: data,
            childrenFound: data?.video?.children?.length || 0,
            children:
              data?.video?.children?.slice(0, 3).map((child: any) => ({
                id: child.id,
                title: child.title?.[0]?.value,
                slug: child.slug
              })) || []
          })
        }
      },
      onError: (error) => {
        console.error('❌ CURRENT VIDEO GraphQL Error:', {
          query:
            currentPool[0] === 'shortFilms'
              ? 'GET_SHORT_FILMS'
              : 'GET_ONE_CHILD_BY_INDEX',
          parentId:
            currentPool[0] !== 'shortFilms' ? currentPool[0] : undefined,
          languageId,
          error: error.message
        })
      }
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
          const offset = getDeterministicOffset('shortFilms', shortFilms.length)
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

          // Only log once per request (avoid React Strict Mode double logging)
          if (!window.__loggedRequests) window.__loggedRequests = new Set()
          const logKey = `queue-${collectionId}-${data?.video?.children?.length}`
          if (!window.__loggedRequests.has(logKey)) {
            window.__loggedRequests.add(logKey)
            console.log('🔄 QUEUE VIDEO GraphQL Response:', {
              query: 'GET_ONE_CHILD_BY_INDEX (lazy)',
              parentId: collectionId,
              languageId,
              responseData: data,
              childrenFound: data?.video?.children?.length || 0
            })
          }

          if (data?.video?.children?.length > 0) {
            const offset = getDeterministicOffset(
              collectionId,
              data.video.children.length
            )
            return data.video.children[offset] || null
          }
        } catch (err) {
          console.warn(
            `Failed to load video from collection ${collectionId}:`,
            err
          )
        }
      }

      return null
    },
    [shortFilmsData, fetchCollectionVideo, languageId]
  )

  // Progressive queue loading with unique pool enforcement
  const loadNextQueueVideo = useCallback(async () => {
    if (loadingQueue.size >= 1) return // Only load one at a time
    if (videoQueue.length >= config.settings.prefetchCount) return // Max videos ahead from config

    const nextQueueIndex = videoQueue.length

    // Get set of pool indexes already used (current + queue)
    const usedPoolIndexes = new Set([
      effectivePoolIndex,
      ...videoQueue.map((v) => v.poolIndex)
    ])

    // Find the next available pool that isn't already in use
    let searchStartIndex = effectivePoolIndex + 1
    let nextPool = null
    let attempts = 0
    const maxAttempts = 30 // More attempts to find unique pools

    while (!nextPool && attempts < maxAttempts) {
      const candidatePool = findNextAvailablePool(searchStartIndex)
      if (!candidatePool) break

      // Check if this pool is already in our current video or queue
      if (!usedPoolIndexes.has(candidatePool.index)) {
        nextPool = candidatePool
        break
      }

      // This pool is already used, try the next one
      searchStartIndex = candidatePool.index + 1
      attempts++
    }

    if (!nextPool) {
      console.warn(
        `Could not find unique pool for queue position ${nextQueueIndex}. Used pools:`,
        Array.from(usedPoolIndexes)
      )
      return
    }

    setLoadingQueue((prev) => new Set(prev).add(nextQueueIndex))

    try {
      const video = await loadVideoFromPool(nextPool)

      if (video) {
        const queuedVideo: QueuedVideo = {
          ...video,
          poolIndex: nextPool.index,
          poolId: nextPool.pool[0],
          isLoaded: true
        }

        // Double-check for duplicates before adding to queue
        setVideoQueue((prev) => {
          const isDuplicate = prev.some(
            (existingVideo) =>
              existingVideo.poolIndex === queuedVideo.poolIndex ||
              existingVideo.id === queuedVideo.id
          )

          if (isDuplicate) {
            console.warn(`Preventing duplicate video in queue:`, {
              video: queuedVideo.id,
              poolIndex: queuedVideo.poolIndex,
              existingQueue: prev.map((v) => ({
                id: v.id,
                poolIndex: v.poolIndex
              }))
            })
            return prev
          }

          return [...prev, queuedVideo]
        })
      }
    } catch (err) {
      console.warn(
        `Failed to load queue video at position ${nextQueueIndex}:`,
        err
      )
    } finally {
      setLoadingQueue((prev) => {
        const newSet = new Set(prev)
        newSet.delete(nextQueueIndex)
        return newSet
      })
    }
  }, [
    videoQueue,
    effectivePoolIndex,
    findNextAvailablePool,
    loadVideoFromPool,
    loadingQueue.size
  ])

  // Process current video from query result
  useEffect(() => {
    if (!currentVideoData) return

    let video: CarouselVideo | null = null

    if (currentPool[0] === 'shortFilms') {
      // Handle short films with deterministic daily selection
      const shortFilms = shortFilmsData?.videos || []
      if (shortFilms.length > 0) {
        const offset = getDeterministicOffset('shortFilms', shortFilms.length)
        video = shortFilms[offset]

        if (video) {
          markPoolVideoPlayed('shortFilms')
        }
      }
    } else if (currentVideoData.video?.children?.[0]) {
      // Handle regular collection video
      const children = currentVideoData.video.children
      const collectionId = currentPool[0]
      const childrenCount = children.length

      if (childrenCount > 0) {
        const offset = getDeterministicOffset(collectionId, childrenCount)
        video = children[offset]

        if (video) {
          // Mark video played for the specific collection
          markPoolVideoPlayed(collectionId)
        }
      }
    }

    if (video) {
      setCurrentVideo(video)
      // Track as played
      addToSessionPlayedIds(video.id)
      addToPersistentPlayedIds(video.id)
    }
  }, [currentVideoData, currentPool, shortFilmsData, effectivePoolIndex])

  // Start progressive loading after current video is set
  useEffect(() => {
    if (!currentVideo || !countsData) return
    loadNextQueueVideo()
  }, [currentVideo, countsData, loadNextQueueVideo])

  // Continue loading next videos after each video is loaded
  useEffect(() => {
    if (
      videoQueue.length > 0 &&
      videoQueue.length < config.settings.prefetchCount &&
      loadingQueue.size === 0
    ) {
      loadNextQueueVideo()
    }
  }, [
    videoQueue.length,
    loadingQueue.size,
    loadNextQueueVideo,
    config.settings.prefetchCount
  ])

  // Debug queue state
  useEffect(() => {
    console.log('🎬 VIDEO QUEUE DEBUG:', {
      currentVideo: currentVideo
        ? {
            id: currentVideo.id,
            title: currentVideo.title[0]?.value,
            poolIndex: effectivePoolIndex
          }
        : null,
      queueLength: videoQueue.length,
      queue: videoQueue.map((video, index) => ({
        position: index,
        id: video.id,
        title: video.title[0]?.value,
        poolIndex: video.poolIndex,
        poolId: video.poolId
      })),
      loading: loadingQueue.size > 0,
      loadingPositions: Array.from(loadingQueue)
    })
  }, [videoQueue, currentVideo, effectivePoolIndex, loadingQueue])

  const moveToNext = useCallback(() => {
    if (videoQueue.length > 0) {
      // Move first queued video to current
      const nextVideo = videoQueue[0]
      setCurrentVideo(nextVideo)

      // Remove from queue and update pool index
      setVideoQueue((prev) => prev.slice(1))
      setPoolIndex(nextVideo.poolIndex)

      // Track as played
      addToSessionPlayedIds(nextVideo.id)
      addToPersistentPlayedIds(nextVideo.id)
      markPoolVideoPlayed(nextVideo.poolId)
    } else {
      // Fallback to old method if queue is empty
      setPoolIndex((prev) => prev + 1)
    }
  }, [videoQueue])

  const moveToPrevious = useCallback(() => {
    setPoolIndex((prev) => Math.max(0, prev - 1))
  }, [])

  const loading = countsLoading || currentVideoLoading

  // nextVideos for carousel display (current video + queue)
  const nextVideos = useMemo(() => {
    return videoQueue.filter((video) => video.isLoaded)
  }, [videoQueue])

  return {
    loading,
    currentVideo,
    nextVideos,
    videoQueue,
    error,
    moveToNext,
    moveToPrevious,
    currentPoolIndex: poolIndex
  }
}
