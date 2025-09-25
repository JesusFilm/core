import { SearchClient, algoliasearch } from 'algoliasearch'
import { useCallback, useState } from 'react'

interface UseTrendingSearchesResult {
  trendingSearches: string[]
  isLoading: boolean
  error: string | null
  fetchTrendingSearches: () => void
}

interface CachedTrendingSearches {
  data: string[]
  timestamp: number
  expiry: number
}

const searchClient: SearchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? '',
  process.env.NEXT_PUBLIC_ALGOLIA_API_KEY ?? ''
)

const CACHE_KEY = 'algolia_trending_searches'
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes in milliseconds

function getCachedTrendingSearches(): string[] | null {
  if (typeof window === 'undefined') return null
  
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null
    
    const parsedCache: CachedTrendingSearches = JSON.parse(cached)
    const now = Date.now()
    
    // Check if cache is still valid
    if (now < parsedCache.expiry) {
      return parsedCache.data
    } else {
      // Cache expired, remove it
      localStorage.removeItem(CACHE_KEY)
      return null
    }
  } catch (error) {
    console.error('Error reading trending searches cache:', error)
    localStorage.removeItem(CACHE_KEY)
    return null
  }
}

function setCachedTrendingSearches(data: string[]): void {
  if (typeof window === 'undefined') return
  
  try {
    const cacheData: CachedTrendingSearches = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + CACHE_DURATION
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
  } catch (error) {
    console.error('Error caching trending searches:', error)
  }
}

export function useTrendingSearches(maxResults: number = 8): UseTrendingSearchesResult {
  const [trendingSearches, setTrendingSearches] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTrendingSearches = useCallback(async () => {
    // Check cache first
    const cachedResults = getCachedTrendingSearches()
    if (cachedResults && cachedResults.length > 0) {
      setTrendingSearches(cachedResults.slice(0, maxResults))
      return
    }

    // Check if we're online before making network requests
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      console.warn('Offline: Using fallback trending searches')
      setError('Offline mode')
      const fallbackSearches = [
        'Jesus',
        'Bible',
        'Gospel',
        'Faith',
        'Prayer',
        'Hope',
        'Love',
        'Christian'
      ]
      const fallbackResults = fallbackSearches.slice(0, maxResults)
      setTrendingSearches(fallbackResults)
      setCachedTrendingSearches(fallbackResults)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX ?? ''

      // Try to get popular search terms by analyzing top content
      // We'll search for empty query and look at popular facet values
      const response = await searchClient.searchSingleIndex({
        indexName,
        searchParams: {
          query: '',
          hitsPerPage: 20,
          attributesToRetrieve: ['title.value', 'description.value'],
          facets: ['title.value', 'label'],
          analytics: true
        }
      })

      // Extract trending terms from titles and descriptions of popular content
      const popularTerms = new Set<string>()

      // Add terms from top hits' titles
      response.hits?.forEach((hit: any) => {
        const titles = hit.title || []
        titles.forEach((titleObj: any) => {
          if (titleObj?.value) {
            const words = titleObj.value
              .toLowerCase()
              .split(/[^a-zA-Z]+/)
              .filter((word: string) => word.length > 2 && word.length < 15)
            words.forEach((word: string) => popularTerms.add(word))
          }
        })
      })

      // Convert to array and filter for relevant terms
      const relevantTerms = Array.from(popularTerms)
        .filter(term =>
          !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'].includes(term)
        )
        .slice(0, maxResults)

      // If we don't have enough terms, supplement with curated terms
      const curatedTerms = [
        'Jesus',
        'Bible',
        'Gospel',
        'Faith',
        'Prayer',
        'Hope',
        'Love',
        'Christian',
        'Salvation',
        'Worship'
      ]

      const finalTerms = [...relevantTerms]
      curatedTerms.forEach(term => {
        if (finalTerms.length < maxResults && !finalTerms.includes(term.toLowerCase())) {
          finalTerms.push(term)
        }
      })

      const results = finalTerms.slice(0, maxResults)
      setTrendingSearches(results)

      // Cache the results
      setCachedTrendingSearches(results)
    } catch (err) {
      console.warn('Network error fetching trending searches, using fallback:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch trending searches')

      // Fallback to static popular searches
      const fallbackSearches = [
        'Jesus',
        'Bible',
        'Gospel',
        'Faith',
        'Prayer',
        'Hope',
        'Love',
        'Christian'
      ]
      const fallbackResults = fallbackSearches.slice(0, maxResults)
      setTrendingSearches(fallbackResults)

      // Cache fallback results too
      setCachedTrendingSearches(fallbackResults)
    } finally {
      setIsLoading(false)
    }
  }, [maxResults])

  return {
    trendingSearches,
    isLoading,
    error,
    fetchTrendingSearches
  }
}