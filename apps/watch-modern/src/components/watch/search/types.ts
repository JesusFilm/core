/**
 * Types for the search suggestions functionality
 */

export interface SuggestionItem {
  /** The suggestion text to display and use for search */
  text: string
  /** Optional highlight information for typed suggestions */
  highlight?: {
    /** The matched portion of the text */
    match: string
    /** The full original text */
    original: string
  }
  /** Optional metadata for future extensions (thumbnails, counts, etc.) */
  metadata?: {
    /** Number of results this suggestion might return */
    count?: number
    /** URL to a thumbnail image */
    thumbnail?: string
    /** Category or type of the suggestion */
    category?: string
  }
}

export interface FetchSuggestionsOptions {
  /** Maximum number of suggestions to return */
  limit?: number
  /** AbortController signal for cancelling the request */
  signal?: AbortSignal
}

export interface FetchPopularOptions extends FetchSuggestionsOptions {}

export interface SuggestionsClient {
  /**
   * Fetch suggestions based on a query string
   * @param query - The search query to find suggestions for
   * @param options - Additional options for the request
   * @returns Promise resolving to an array of suggestion items
   */
  fetchSuggestions(query: string, options?: FetchSuggestionsOptions): Promise<SuggestionItem[]>

  /**
   * Fetch popular/trending suggestions for when the input is empty
   * @param options - Additional options for the request
   * @returns Promise resolving to an array of popular suggestion items
   */
  fetchPopular(options?: FetchPopularOptions): Promise<SuggestionItem[]>
}

export interface CachedSuggestions {
  /** The cached suggestion items */
  items: SuggestionItem[]
  /** Timestamp when this cache entry was created */
  timestamp: number
  /** The query that generated these suggestions */
  query: string
}
