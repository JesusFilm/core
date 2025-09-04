/**
 * Utility functions for MediaCard component
 */

/**
 * Media kind type definitions
 */
export type MediaKind = 'feature-film' | 'chapter' | 'series' | 'collection' | 'episode'

/**
 * Maps media kind to display label
 */
export const kindToLabel = (kind: MediaKind): string => {
  switch (kind) {
    case 'feature-film':
      return 'FEATURE FILM'
    case 'chapter':
      return 'CHAPTER'
    case 'series':
      return 'SERIES'
    case 'collection':
      return 'COLLECTION'
    case 'episode':
      return 'EPISODE'
    default:
      return kind.toUpperCase()
  }
}

/**
 * Maps media kind to text color class
 */
export const kindToColor = (kind: MediaKind): string => {
  switch (kind) {
    case 'feature-film':
      return 'text-amber-400'
    case 'chapter':
      return 'text-indigo-400'
    case 'series':
      return 'text-green-400'
    case 'collection':
      return 'text-orange-400'
    case 'episode':
      return 'text-sky-400'
    default:
      return 'text-white'
  }
}

/**
 * Formats duration in seconds to MM:SS or h:mm:ss format
 */
export const formatDuration = (seconds: number): string => {
  const totalSeconds = Math.floor(seconds)

  if (totalSeconds < 3600) {
    // Less than 1 hour: MM:SS
    const minutes = Math.floor(totalSeconds / 60)
    const remainingSeconds = totalSeconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  } else {
    // 1 hour or more: h:mm:ss
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const remainingSeconds = totalSeconds % 60
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }
}

/**
 * Formats count label for collections/series
 */
export const formatCountLabel = (count: number, type: 'chapters' | 'episodes' | 'items'): string => {
  return `${count} ${type}`
}
