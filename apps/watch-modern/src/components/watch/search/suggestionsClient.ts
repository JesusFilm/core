"use client"

import { algoliasearch } from 'algoliasearch'

import type { CachedSuggestions, FetchPopularOptions, FetchSuggestionsOptions, SuggestionItem, SuggestionsClient } from './types'

import trendingSearches from '@/data/trending-searches.json'
import { env } from '@/env'

/**
 * Configuration for the suggestions client
 */
const SUGGESTIONS_CONFIG = {
  /** Maximum length for suggestion text */
  MAX_SUGGESTION_LENGTH: 80,
  /** Default limit for suggestions */
  DEFAULT_LIMIT: 8,
  /** Cache TTL in milliseconds (2 minutes) */
  CACHE_TTL: 2 * 60 * 1000,
  /** Debounce delay in milliseconds */
  DEBOUNCE_DELAY: 200,
  /** Minimum query length to trigger suggestions */
  MIN_QUERY_LENGTH: 1
} as const

/**
 * Algolia client for Query Suggestions
 * Created lazily to allow for proper mocking in tests
 */
let algoliaSuggestionsClient: ReturnType<typeof algoliasearch> | null = null

/**
 * Allow external injection of a shared Algolia client (from InstantSearchProviders)
 */
export function setSuggestionsAlgoliaClient(client: ReturnType<typeof algoliasearch>): void {
  algoliaSuggestionsClient = client
}

function getAlgoliaClient() {
  if (!algoliaSuggestionsClient) {
    // Check if Algolia credentials are available
    if (!env.NEXT_PUBLIC_ALGOLIA_APP_ID || !env.NEXT_PUBLIC_ALGOLIA_API_KEY) {
      throw new Error('Algolia credentials not available')
    }

    algoliaSuggestionsClient = algoliasearch(
      env.NEXT_PUBLIC_ALGOLIA_APP_ID,
      env.NEXT_PUBLIC_ALGOLIA_API_KEY
    )
  }
  return algoliaSuggestionsClient
}

/**
 * Reset the Algolia client (for testing purposes)
 */
export function resetAlgoliaClient() {
  algoliaSuggestionsClient = null
}

/**
 * In-memory cache for suggestions
 */
class SuggestionsCache {
  private cache = new Map<string, CachedSuggestions>()

  /**
   * Get cached suggestions if they exist and are not expired
   */
  get(query: string): SuggestionItem[] | null {
    const cached = this.cache.get(query)
    if (!cached) return null

    const now = Date.now()
    if (now - cached.timestamp > SUGGESTIONS_CONFIG.CACHE_TTL) {
      this.cache.delete(query)
      return null
    }

    return cached.items
  }

  /**
   * Set suggestions in cache
   */
  set(query: string, items: SuggestionItem[]): void {
    this.cache.set(query, {
      items,
      timestamp: Date.now(),
      query
    })
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear()
  }
}

/**
 * Sanitize and validate suggestion text for Algolia queries
 */
function sanitizeSuggestion(text: string): string {
  if (typeof text !== 'string') return ''

  // Trim whitespace
  let sanitized = text.trim()

  // Reject if empty
  if (!sanitized) return ''

  // Reject control characters (including null bytes, newlines, etc.)
  if (/[\x00-\x1F\x7F-\x9F]/.test(sanitized)) return ''

  // Reject strings that could be used for injection or XSS
  if (/[<>'"&]/.test(sanitized)) return ''

  // Limit length to prevent extremely long queries
  if (sanitized.length > SUGGESTIONS_CONFIG.MAX_SUGGESTION_LENGTH) {
    sanitized = sanitized.substring(0, SUGGESTIONS_CONFIG.MAX_SUGGESTION_LENGTH).trim()
  }

  // Ensure the string is not just punctuation
  if (/^[^\w\s]*$/.test(sanitized)) return ''

  return sanitized
}

/**
 * Fuzzy match function for finding suggestions based on query
 */
function fuzzyMatch(query: string, suggestion: string): { score: number; highlight?: { match: string; original: string } } {
  const queryLower = query.toLowerCase()
  const suggestionLower = suggestion.toLowerCase()

  // Exact match gets highest score
  if (suggestionLower === queryLower) {
    return {
      score: 100,
      highlight: { match: suggestion, original: suggestion }
    }
  }

  // Starts with query gets high score
  if (suggestionLower.startsWith(queryLower)) {
    return {
      score: 80,
      highlight: { match: suggestion.substring(0, query.length), original: suggestion }
    }
  }

  // Contains query gets medium score
  const index = suggestionLower.indexOf(queryLower)
  if (index !== -1) {
    return {
      score: 60,
      highlight: { match: suggestion.substring(index, index + query.length), original: suggestion }
    }
  }

  // No match
  return { score: 0 }
}

/**
 * Debounce utility for delaying function calls
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: NodeJS.Timeout | null = null
  let currentPromise: Promise<ReturnType<T>> | null = null
  let currentResolve: ((value: ReturnType<T>) => void) | null = null
  let currentReject: ((reason: any) => void) | null = null

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    // Create new promise for this call
    currentPromise = new Promise<ReturnType<T>>((resolve, reject) => {
      currentResolve = resolve
      currentReject = reject
    })

    // Set new timeout
    timeoutId = setTimeout(async () => {
      try {
        const result = await func(...args)
        if (currentResolve) {
          currentResolve(result)
        }
      } catch (error) {
        if (currentReject) {
          currentReject(error)
        }
      }
    }, delay)

    return currentPromise
  }
}

/**
 * Client for fetching search suggestions
 *
 * Features:
 * - Debounced requests (200ms)
 * - In-memory caching with TTL (2 minutes)
 * - Fuzzy matching for typed suggestions
 * - Popular/trending suggestions for empty queries
 * - Request cancellation support
 * - Input sanitization and security measures
 */
class SuggestionsClientImpl implements SuggestionsClient {
  private cache = new SuggestionsCache()
  private debouncedFetchSuggestions: (query: string, options?: FetchSuggestionsOptions) => Promise<SuggestionItem[]>

  constructor() {
    // Create debounced version of the fetch function
    this.debouncedFetchSuggestions = debounce(
      this.doFetchSuggestions.bind(this),
      SUGGESTIONS_CONFIG.DEBOUNCE_DELAY
    )
  }

  async fetchSuggestions(query: string, options: FetchSuggestionsOptions = {}): Promise<SuggestionItem[]> {
    const { limit = SUGGESTIONS_CONFIG.DEFAULT_LIMIT, signal } = options

    // Check for abort signal
    if (signal?.aborted) {
      throw new Error('Request aborted')
    }

    // Sanitize query
    const sanitizedQuery = sanitizeSuggestion(query)
    if (!sanitizedQuery || sanitizedQuery.length < SUGGESTIONS_CONFIG.MIN_QUERY_LENGTH) {
      // Return popular suggestions for very short queries
      return this.fetchPopular({ limit, signal })
    }

    // Check cache first
    const cached = this.cache.get(sanitizedQuery)
    if (cached) {
      return cached.slice(0, limit)
    }

    // Use debounced fetch
    const suggestions = await this.debouncedFetchSuggestions(sanitizedQuery, { limit, signal })

    // Cache the results
    this.cache.set(sanitizedQuery, suggestions)

    return suggestions
  }

  async fetchPopular(options: FetchPopularOptions = {}): Promise<SuggestionItem[]> {
    const { limit = SUGGESTIONS_CONFIG.DEFAULT_LIMIT, signal } = options

    // Check for abort signal
    if (signal?.aborted) {
      throw new Error('Request aborted')
    }

    // Check cache first
    const cacheKey = '__popular__'
    const cached = this.cache.get(cacheKey)
    if (cached) {
      return cached.slice(0, limit)
    }

    try {
      // Use Algolia Query Suggestions with zero-query search for popular queries
      const response = await getAlgoliaClient().search({
        requests: [{
          indexName: env.NEXT_PUBLIC_ALGOLIA_SUGGESTIONS_INDEX,
          query: '',
          hitsPerPage: limit,
          analytics: false,
          clickAnalytics: false,
          attributesToRetrieve: ['query', 'popularity']
        }]
      })

      // Convert Algolia response to SuggestionItem format
      const suggestions: SuggestionItem[] = response.results[0].hits.map((hit: any) => ({
        text: sanitizeSuggestion(hit.query) || hit.query,
        metadata: {
          count: hit.popularity
        }
      }))

      // Cache the results
      this.cache.set(cacheKey, suggestions)

      return suggestions
    } catch (error) {
      console.warn('Failed to fetch popular suggestions from Algolia, falling back to curated data:', error)

      // Fallback to curated JSON if Algolia fails
      const suggestions: SuggestionItem[] = trendingSearches
        .slice(0, limit)
        .map(text => ({
          text: sanitizeSuggestion(text) || text // Fallback to original if sanitization fails
        }))
        .filter(item => item.text.length > 0)

      // Cache the results
      this.cache.set(cacheKey, suggestions)

      return suggestions
    }
  }

  /**
   * Internal method to perform the actual suggestion fetching (not debounced)
   */
  private async doFetchSuggestions(query: string, options: FetchSuggestionsOptions = {}): Promise<SuggestionItem[]> {
    const { limit = SUGGESTIONS_CONFIG.DEFAULT_LIMIT, signal } = options

    // Check for abort signal
    if (signal?.aborted) {
      throw new Error('Request aborted')
    }

    try {
      // Use Algolia Query Suggestions for typed queries
      const response = await getAlgoliaClient().search({
        requests: [{
          indexName: env.NEXT_PUBLIC_ALGOLIA_SUGGESTIONS_INDEX,
          query,
          hitsPerPage: limit,
          analytics: false,
          clickAnalytics: false,
          attributesToRetrieve: ['query', 'popularity']
        }]
      })

      // Convert Algolia response to SuggestionItem format
      const suggestions: SuggestionItem[] = response.results[0].hits.map((hit: any) => ({
        text: sanitizeSuggestion(hit.query) || hit.query,
        highlight: this.createHighlight(hit.query, query),
        metadata: {
          count: hit.popularity
        }
      }))

      return suggestions
    } catch (error) {
      console.warn('Failed to fetch suggestions from Algolia, falling back to curated data:', error)

      // Fallback to curated JSON if Algolia fails
      const scoredSuggestions = trendingSearches
        .map(suggestion => {
          const match = fuzzyMatch(query, suggestion)
          return {
            suggestion,
            score: match.score,
            highlight: match.highlight
          }
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)

      // Convert to SuggestionItem format
      const suggestions: SuggestionItem[] = scoredSuggestions.map(({ suggestion, highlight }) => ({
        text: sanitizeSuggestion(suggestion) || suggestion,
        highlight
      }))

      return suggestions
    }
  }

  /**
   * Create highlight object for Algolia suggestions
   */
  private createHighlight(text: string, query: string): SuggestionItem['highlight'] {
    const queryLower = query.toLowerCase()
    const textLower = text.toLowerCase()
    const index = textLower.indexOf(queryLower)

    if (index === -1) return undefined

    return {
      match: text.substring(index, index + query.length),
      original: text
    }
  }

  /**
   * Clear the suggestions cache
   */
  clearCache(): void {
    this.cache.clear()
  }
}

// Export singleton instance
export const suggestionsClient = new SuggestionsClientImpl()

// Export the class for testing purposes
export { SuggestionsClientImpl }
