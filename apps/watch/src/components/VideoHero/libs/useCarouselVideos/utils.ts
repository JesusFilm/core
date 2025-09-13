import playlistConfig from '../../../../../config/video-playlist.json'

export interface PlaylistConfig {
  version: string
  playlistSequence: string[][]
  settings: {
    recentlyPlayedBuffer: number
    cycleOnComplete: boolean
    weightedRandomization: boolean
    fallbackStrategy: string
    language: string
  }
}

export const getPlaylistConfig = (): PlaylistConfig => {
  return playlistConfig as PlaylistConfig
}

export const getDeterministicOffset = (
  collectionId: string,
  childrenCount: number,
  cycleContext?: { poolIndex?: number; totalVideosLoaded?: number }
): number => {
  if (childrenCount === 0) return 0

  // Use business timezone (assuming US Eastern for Jesus Film Project)
  const businessTimezone = 'America/New_York'
  const today = new Date().toLocaleDateString('en-CA', {
    timeZone: businessTimezone
  }) // YYYY-MM-DD format

  // Include cycle context to get different videos on subsequent visits
  let seedString = today + collectionId

  if (cycleContext) {
    // Add pool index to vary selection when cycling through the same collection
    if (cycleContext.poolIndex !== undefined) {
      const cycleNumber = Math.floor(cycleContext.poolIndex / 15) // Rough cycle through playlist (15 pools)
      seedString += `-cycle${cycleNumber}`
    }

    // Add total videos loaded to ensure progression even within the same cycle
    if (cycleContext.totalVideosLoaded !== undefined) {
      const progressionFactor = Math.floor(cycleContext.totalVideosLoaded / 10) // Change every 10 videos
      seedString += `-prog${progressionFactor}`
    }
  }

  console.log('🎲 GENERATING DETERMINISTIC OFFSET:', {
    collectionId,
    childrenCount,
    cycleContext,
    seedString,
    seed: simpleHash(seedString),
    offset: simpleHash(seedString) % childrenCount
  })

  const seed = simpleHash(seedString)
  return seed % childrenCount
}

export const getRandomFromMultipleCollections = (
  collections: { id: string; childrenCount: number }[],
  periodKey: string
): { collectionId: string; childIndex: number } => {
  if (collections.length === 0) {
    return { collectionId: '', childIndex: 0 }
  }

  const totalCount = collections.reduce(
    (sum, col) => sum + col.childrenCount,
    0
  )
  const seed = simpleHash(periodKey + collections.map((c) => c.id).join(''))
  const globalIndex = seed % totalCount

  let currentSum = 0
  for (const collection of collections) {
    currentSum += collection.childrenCount
    if (globalIndex < currentSum) {
      const childIndex = globalIndex - (currentSum - collection.childrenCount)
      return {
        collectionId: collection.id,
        childIndex
      }
    }
  }

  // Fallback to first collection
  return {
    collectionId: collections[0].id,
    childIndex: 0
  }
}

// Simple hash function for deterministic randomness
const simpleHash = (str: string): number => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

// Session storage management
export const getSessionPlayedIds = (): string[] => {
  if (typeof window === 'undefined') return []
  const stored = sessionStorage.getItem('carousel-played-ids')
  return stored ? JSON.parse(stored) : []
}

export const addToSessionPlayedIds = (videoId: string): void => {
  if (typeof window === 'undefined') return
  const current = getSessionPlayedIds()
  const updated = [...current, videoId]
  sessionStorage.setItem('carousel-played-ids', JSON.stringify(updated))
}

// Persistent storage with monthly reset
export const getPersistentPlayedIds = (): string[] => {
  if (typeof window === 'undefined') return []

  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
  const stored = localStorage.getItem('carousel-played-ids')

  if (!stored) return []

  const data = JSON.parse(stored)

  // Reset if it's a new month
  if (data.month !== currentMonth) {
    localStorage.removeItem('carousel-played-ids')
    return []
  }

  return data.ids || []
}

export const addToPersistentPlayedIds = (videoId: string): void => {
  if (typeof window === 'undefined') return

  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
  const current = getPersistentPlayedIds()
  const updated = [...current, videoId]

  localStorage.setItem(
    'carousel-played-ids',
    JSON.stringify({
      month: currentMonth,
      ids: updated
    })
  )
}

export const isVideoAlreadyPlayed = (videoId: string): boolean => {
  const sessionPlayed = getSessionPlayedIds()
  const persistentPlayed = getPersistentPlayedIds()

  return sessionPlayed.includes(videoId) || persistentPlayed.includes(videoId)
}

export const isPoolExhausted = (
  poolId: string,
  childrenCount: number
): boolean => {
  if (typeof window === 'undefined') return false

  // Get unique video IDs played from this specific pool
  const poolVideosKey = `pool-${poolId}-videos`
  const poolPlayedVideosJson = sessionStorage.getItem(poolVideosKey) || '[]'

  try {
    const poolPlayedVideos: string[] = JSON.parse(poolPlayedVideosJson)
    const uniqueVideosPlayed = new Set(poolPlayedVideos).size

    console.log('🔍 POOL EXHAUSTION CHECK:', {
      poolId,
      childrenCount,
      uniqueVideosPlayed,
      totalPlayedVideoIds: poolPlayedVideos.length,
      isExhausted: uniqueVideosPlayed >= childrenCount,
      playedVideoIds: poolPlayedVideos.slice(-5) // Show last 5 for debugging
    })

    return uniqueVideosPlayed >= childrenCount
  } catch (error) {
    console.warn('Failed to parse pool played videos:', error)
    return false
  }
}

export const markPoolVideoPlayed = (poolId: string, videoId?: string): void => {
  if (typeof window === 'undefined') return

  // If no videoId provided, fall back to the old counter method for backward compatibility
  if (!videoId) {
    const poolKey = `pool-${poolId}`
    const poolPlayedKey = `${poolKey}-played`
    const current = parseInt(sessionStorage.getItem(poolPlayedKey) || '0', 10)
    sessionStorage.setItem(poolPlayedKey, (current + 1).toString())
    return
  }

  // Track specific video IDs played from this pool
  const poolVideosKey = `pool-${poolId}-videos`
  const poolPlayedVideosJson = sessionStorage.getItem(poolVideosKey) || '[]'

  try {
    const poolPlayedVideos: string[] = JSON.parse(poolPlayedVideosJson)

    // Add this video ID if it's not already tracked
    if (!poolPlayedVideos.includes(videoId)) {
      poolPlayedVideos.push(videoId)
      sessionStorage.setItem(poolVideosKey, JSON.stringify(poolPlayedVideos))

      console.log('✅ MARKED POOL VIDEO PLAYED:', {
        poolId,
        videoId,
        totalUniqueVideos: new Set(poolPlayedVideos).size,
        allPlayedVideoIds: poolPlayedVideos
      })
    } else {
      console.log('ℹ️ VIDEO ALREADY MARKED FOR POOL:', {
        poolId,
        videoId,
        existingCount: new Set(poolPlayedVideos).size
      })
    }
  } catch (error) {
    console.warn('Failed to mark pool video played:', error)
    // Fall back to old method
    const poolKey = `pool-${poolId}`
    const poolPlayedKey = `${poolKey}-played`
    const current = parseInt(sessionStorage.getItem(poolPlayedKey) || '0', 10)
    sessionStorage.setItem(poolPlayedKey, (current + 1).toString())
  }
}

export const getPoolKey = (pool: string[]): string => [...pool].sort().join('|')

// Session video state management
interface SessionVideoState {
  videoId: string
  videoSlug: string
  videoTitle: string
  poolIndex: number
  poolId: string
  timestamp: number
}

export const saveCurrentVideoSession = (
  videoId: string,
  videoSlug: string,
  videoTitle: string,
  poolIndex: number,
  poolId: string
): void => {
  if (typeof window === 'undefined') return

  const sessionState: SessionVideoState = {
    videoId,
    videoSlug,
    videoTitle,
    poolIndex,
    poolId,
    timestamp: Date.now()
  }

  sessionStorage.setItem('carousel-current-video', JSON.stringify(sessionState))
}

export const loadCurrentVideoSession = (): SessionVideoState | null => {
  if (typeof window === 'undefined') return null

  try {
    const stored = sessionStorage.getItem('carousel-current-video')
    if (!stored) return null

    const sessionState: SessionVideoState = JSON.parse(stored)

    // Check if session is less than 24 hours old
    const hoursAgo = (Date.now() - sessionState.timestamp) / (1000 * 60 * 60)
    if (hoursAgo > 24) {
      sessionStorage.removeItem('carousel-current-video')
      return null
    }

    return sessionState
  } catch (error) {
    console.warn('Failed to load current video session:', error)
    sessionStorage.removeItem('carousel-current-video')
    return null
  }
}

export const clearCurrentVideoSession = (): void => {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem('carousel-current-video')
}
