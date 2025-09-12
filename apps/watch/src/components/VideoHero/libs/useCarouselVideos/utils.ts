import playlistConfig from '../../../../../config/video-playlist.json'

export interface PlaylistConfig {
  version: string
  playlistSequence: string[][]
  settings: {
    prefetchCount: number
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
  childrenCount: number
): number => {
  if (childrenCount === 0) return 0

  // Use business timezone (assuming US Eastern for Jesus Film Project)
  const businessTimezone = 'America/New_York'
  const today = new Date().toLocaleDateString('en-CA', {
    timeZone: businessTimezone
  }) // YYYY-MM-DD format
  const periodKey = today
  const seed = simpleHash(periodKey + collectionId)
  return seed % childrenCount
}

export const getRandomFromMultipleCollections = (
  collections: { id: string; childrenCount: number }[],
  periodKey: string
): { collectionId: string; childIndex: number } => {
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

  const sessionPlayed = getSessionPlayedIds()
  const poolKey = `pool-${poolId}`

  // Get videos played from this specific pool in this session
  const poolPlayedKey = `${poolKey}-played`
  const poolPlayedCount = parseInt(
    sessionStorage.getItem(poolPlayedKey) || '0',
    10
  )

  return poolPlayedCount >= childrenCount
}

export const markPoolVideoPlayed = (poolId: string): void => {
  if (typeof window === 'undefined') return

  const poolKey = `pool-${poolId}`
  const poolPlayedKey = `${poolKey}-played`
  const current = parseInt(sessionStorage.getItem(poolPlayedKey) || '0', 10)

  sessionStorage.setItem(poolPlayedKey, (current + 1).toString())
}

export const getPoolKey = (pool: string[]): string => {
  return pool.sort().join('|')
}
