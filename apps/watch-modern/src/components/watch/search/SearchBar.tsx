"use client"

import * as React from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SuggestionsList } from "./SuggestionsList"
import { suggestionsClient, setSuggestionsAlgoliaClient } from "./suggestionsClient"
import type { SuggestionItem } from "./types"
import { useOptionalAlgoliaClient } from '@/components/providers/instantsearch'

export interface SearchBarProps {
  /** Initial search value (optional) */
  initialValue?: string
  /** Called when search should be submitted (Enter key or submit button) */
  onSubmit: (value: string) => void
  /** Called when the input receives focus */
  onFocus?: () => void
  /** Called when the input loses focus */
  onBlur?: () => void
  /** Called when suggestions are closed */
  onSuggestionsClose?: () => void
  /** Called whenever the input value changes */
  onValueChange?: (value: string) => void
  /** Called specifically when the input is cleared */
  onClear?: () => void
  /** Whether the search is currently loading */
  loading?: boolean
  /** Placeholder text for the input */
  placeholder?: string
  /** Additional CSS classes */
  className?: string
  /** Whether suggestions are currently open */
  isSuggestionsOpen?: boolean
  /** Force the input to display this value when it changes */
  forceValue?: string
}

/**
 * SearchBar component - A modern search input with submit button
 *
 * Features:
 * - Rounded pill design with dark theme
 * - Right-aligned submit button
 * - Clear button when input has value
 * - WAI-ARIA combobox pattern for accessibility
 * - Keyboard navigation (Enter to submit, Escape to clear)
 *
 * @example
 * ```tsx
 * <SearchBar
 *   initialValue={searchValue}
 *   onSubmit={(value) => console.log('Search:', value)}
 *   onSuggestionsClose={() => setIsOpen(false)}
 *   placeholder="Search videos, films, and series..."
 *   isSuggestionsOpen={isOpen}
 * />
 * ```
 */
export const SearchBar = React.forwardRef<HTMLDivElement, SearchBarProps>(
  ({
    initialValue = '',
    onSubmit,
    onFocus,
    onBlur,
    onSuggestionsClose,
    onValueChange,
    onClear,
    loading = false,
    placeholder = "Search...",
    className,
    isSuggestionsOpen = false,
    forceValue,
    ...props
  }, ref) => {
    const algoliaCtx = useOptionalAlgoliaClient()
    const inputRef = React.useRef<HTMLInputElement>(null)
    const containerRef = React.useRef<HTMLDivElement>(null)
    const [inputValue, setInputValue] = React.useState(initialValue)
    const [suggestions, setSuggestions] = React.useState<SuggestionItem[]>([])
    const [showSuggestions, setShowSuggestions] = React.useState(false)
    const [highlightedIndex, setHighlightedIndex] = React.useState(-1)
    const abortControllerRef = React.useRef<AbortController | null>(null)
    const skipNextFocusFetchRef = React.useRef(false)
    const isUserInteractingRef = React.useRef(false)

    // Ensure suggestionsClient uses the shared Algolia client from InstantSearchProviders
    React.useEffect(() => {
      if (algoliaCtx?.searchClient) setSuggestionsAlgoliaClient(algoliaCtx.searchClient)
    }, [algoliaCtx?.searchClient])

    // Sync input value with initialValue changes, but avoid interfering with user interactions
    React.useEffect(() => {
      console.log('🔍 useEffect triggered - initialValue:', initialValue, 'inputValue:', inputValue, 'isUserInteracting:', isUserInteractingRef.current)

      // Don't override input value if user is actively interacting
      if (!isUserInteractingRef.current && initialValue !== inputValue) {
        console.log('🔍 Syncing inputValue with initialValue:', initialValue)
        setInputValue(initialValue)
        // Inform parent so overlay can reflect initial value state
        try {
          onValueChange?.(initialValue)
        } catch {}

        // If initialValue is empty (cleared externally), also clear suggestions
        if (!initialValue || initialValue.trim() === '') {
          console.log('🔍 initialValue is empty, clearing suggestions')
          setShowSuggestions(true)
          setSuggestions([])
          setHighlightedIndex(-1)
        }
      } else {
        console.log('🔍 Skipping sync - user is interacting or values are the same')
      }
    }, [initialValue]) // Removed inputValue from dependencies to prevent infinite loop

    // Force sync from external value (e.g., clicking a Popular Search pill)
    React.useEffect(() => {
      if (typeof forceValue === 'undefined') return
      if (forceValue !== inputValue) {
        setInputValue(forceValue)
        onValueChange?.(forceValue)
      }
    }, [forceValue])

    // Fetch suggestions based on current value
    const fetchSuggestions = React.useCallback(async (query: string) => {
      console.log('🔍 fetchSuggestions called with query:', query)

      // Cancel previous request
      if (abortControllerRef.current) {
        console.log('🔍 Aborting previous request')
        abortControllerRef.current.abort()
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController()
      console.log('🔍 Created new abort controller')
      const localController = abortControllerRef.current
      const localSignal = localController.signal

      try {
        console.log('🔍 Setting loading state to true')

        // Do not show popular suggestions in dropdown; only show typed suggestions
        const trimmed = query.trim()
        if (trimmed.length === 0) {
          if (abortControllerRef.current === localController && !localSignal.aborted) {
            console.log('🔍 Empty query: clearing suggestions list')
            setSuggestions([])
            setHighlightedIndex(-1)
          }
          return
        }

        // Show typed suggestions
        console.log('🔍 Fetching typed suggestions for:', trimmed)
        const fetchedSuggestions: SuggestionItem[] = await suggestionsClient.fetchSuggestions(trimmed, {
          signal: localSignal
        })
        console.log('🔍 Typed suggestions fetched:', fetchedSuggestions?.length || 0)

        // Only update if this request is still the latest and wasn't aborted
        if (abortControllerRef.current === localController && !localSignal.aborted) {
          console.log('🔍 Setting suggestions:', fetchedSuggestions?.length || 0, 'items')
          setSuggestions(fetchedSuggestions)
          setHighlightedIndex(-1) // Reset highlight
        } else {
          console.log('🔍 Request was aborted, not updating suggestions')
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError' && abortControllerRef.current === localController) {
          console.error('❌ Failed to fetch suggestions:', error)
        } else {
          console.log('🔍 Request aborted (this is normal)')
        }
      } finally {
        if (abortControllerRef.current === localController && !localSignal.aborted) {
          console.log('🔍 Setting loading state to false')
        } else {
          console.log('🔍 Not setting loading to false because request was aborted')
        }
      }
    }, [onValueChange, onClear])

    // Handle input change
    const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      console.log('🔍 handleInputChange called with newValue:', newValue)
      isUserInteractingRef.current = true
      console.log('🔍 Setting inputValue to:', newValue)
      setInputValue(newValue)
      onValueChange?.(newValue)

      // Fetch suggestions for the new value
      if (showSuggestions) {
        console.log('🔍 showSuggestions is true, calling fetchSuggestions')
        fetchSuggestions(newValue)
      } else {
        console.log('🔍 showSuggestions is false, skipping fetchSuggestions')
      }

      // Reset interaction flag after a short delay
      setTimeout(() => {
        console.log('🔍 Resetting user interaction flag')
        isUserInteractingRef.current = false
      }, 100)
    }, [showSuggestions, fetchSuggestions])

    // Handle input focus
    const handleFocus = React.useCallback(() => {
      console.log('🔍 handleFocus called')
      onFocus?.()

      // Show suggestions on focus
      console.log('🔍 Setting showSuggestions to true')
      setShowSuggestions(true)
      // Clear current list immediately to avoid stale highlights
      setSuggestions([])
      // Clear current list immediately to avoid stale highlights
      setSuggestions([])
      if (skipNextFocusFetchRef.current) {
        console.log('🔍 Skipping focus-triggered fetch due to recent clear')
        skipNextFocusFetchRef.current = false
      } else {
        // Only fetch typed suggestions; do not fetch popular on empty input
        if (inputValue.trim().length > 0) {
          console.log('🔍 Calling fetchSuggestions with inputValue:', inputValue)
          fetchSuggestions(inputValue)
        } else {
          console.log('🔍 Input is empty on focus; not fetching suggestions')
        }
      }
    }, [onFocus, inputValue, fetchSuggestions])

    // Handle input blur with delay to allow suggestion clicks
    const handleBlur = React.useCallback(() => {
      console.log('🔍 handleBlur called')
      // Notify parent immediately that input lost focus
      onBlur?.()
      // Delay blur to allow suggestion clicks
      setTimeout(() => {
        console.log('🔍 Blur timeout triggered - closing suggestions')
        console.log('🔍 Setting showSuggestions to false')
        setShowSuggestions(false)
        console.log('🔍 Clearing suggestions array')
        setSuggestions([])
        console.log('🔍 Resetting highlightedIndex to -1')
        setHighlightedIndex(-1)
        console.log('🔍 Calling onSuggestionsClose')
        onSuggestionsClose?.()
      }, 150)
    }, [onSuggestionsClose, onBlur])

    // Handle key down events
    const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
      console.log('🔍 handleKeyDown called with key:', e.key)

      if (e.key === 'Enter') {
        console.log('🔍 Enter key pressed')
        e.preventDefault()
        if (showSuggestions && suggestions[highlightedIndex]) {
          console.log('🔍 Selecting highlighted suggestion at index:', highlightedIndex)
          // Select highlighted suggestion
          handleSuggestionSelect(suggestions[highlightedIndex])
        } else {
          console.log('🔍 No highlighted suggestion, submitting input value:', inputValue)
          // Submit current input value
          onSubmit(inputValue)
        }
      } else if (e.key === 'Escape') {
        console.log('🔍 Escape key pressed')
        e.preventDefault()
        if (showSuggestions) {
          console.log('🔍 Closing suggestions')
          // Close suggestions
          setShowSuggestions(false)
          setSuggestions([])
          setHighlightedIndex(-1)
          // Notify parent so overlays can close too
          onSuggestionsClose?.()
        } else {
          console.log('🔍 Clearing input and blurring')
          // Clear input and blur
          setInputValue('')
          onValueChange?.('')
          onClear?.()
          inputRef.current?.blur()
        }
      } else if (e.key === 'ArrowDown' && showSuggestions && suggestions.length > 0) {
        console.log('🔍 ArrowDown key pressed')
        e.preventDefault()
        const nextIndex = highlightedIndex < suggestions.length - 1 ? highlightedIndex + 1 : 0
        console.log('🔍 Moving highlight to index:', nextIndex)
        setHighlightedIndex(nextIndex)
      } else if (e.key === 'ArrowUp' && showSuggestions && suggestions.length > 0) {
        console.log('🔍 ArrowUp key pressed')
        e.preventDefault()
        const prevIndex = highlightedIndex > 0 ? highlightedIndex - 1 : suggestions.length - 1
        console.log('🔍 Moving highlight to index:', prevIndex)
        setHighlightedIndex(prevIndex)
      }
    }, [inputValue, onSubmit, showSuggestions, suggestions, highlightedIndex])

    // Handle suggestion selection
    const handleSuggestionSelect = React.useCallback((suggestion: SuggestionItem) => {
      console.log('🔍 handleSuggestionSelect called with suggestion:', suggestion)
      isUserInteractingRef.current = true
      setInputValue(suggestion.text)
      onValueChange?.(suggestion.text)
      console.log('🔍 Setting input value to:', suggestion.text)
      console.log('🔍 Calling onSubmit with:', suggestion.text)
      onSubmit(suggestion.text)
      console.log('🔍 Closing suggestions')
      setShowSuggestions(false)
      setSuggestions([])
      setHighlightedIndex(-1)
      console.log('🔍 Blurring input')
      inputRef.current?.blur()

      // Reset interaction flag after submit completes
      setTimeout(() => {
        console.log('🔍 Resetting interaction flag')
        isUserInteractingRef.current = false
      }, 200)
    }, [onSubmit])

    // Handle suggestion highlight change
    const handleSuggestionHighlightChange = React.useCallback((index: number) => {
      setHighlightedIndex(index)
    }, [])

    // Handle suggestions close
    const handleSuggestionsClose = React.useCallback(() => {
      setShowSuggestions(false)
      setSuggestions([])
      setHighlightedIndex(-1)
      onSuggestionsClose?.()
    }, [onSuggestionsClose])

    // Handle submit button click
    const handleSubmit = React.useCallback(() => {
      console.log('🔍 handleSubmit called with inputValue:', inputValue)
      onValueChange?.(inputValue)
      onSubmit(inputValue)
    }, [inputValue, onSubmit])

    // Handle clear button click - Phase 2B: Clear and show popular suggestions
    const handleClear = React.useCallback(() => {
      console.log('🔍 handleClear called')
      // Clear the input locally and blur the field per UX requirement
      console.log('🔍 Clearing input value')
      setInputValue('')
      onValueChange?.('')
      onClear?.()

      // Close any suggestions and reset state
      setShowSuggestions(false)
      setSuggestions([])
      setHighlightedIndex(-1)

      // Cancel any in-flight requests
      if (abortControllerRef.current) {
        console.log('🔍 Aborting in-flight request')
        abortControllerRef.current.abort()
      }

      console.log('🔍 Blurring input after clear')
      inputRef.current?.blur()
    }, [])

    const hasValue = inputValue.trim().length > 0
    const isPopular = inputValue.trim().length === 0

    return (
      <div
        ref={(node) => {
          // Handle both the forwarded ref and our container ref
          if (typeof ref === 'function') {
            ref(node)
          } else if (ref) {
            ref.current = node
          }
          containerRef.current = node
        }}
        className={cn(
          "relative max-w-3xl mx-auto",
          className
        )}
        {...props}
      >
        {/* Search input with WAI-ARIA combobox pattern */}
        <div
          role="combobox"
          aria-expanded={isSuggestionsOpen}
          aria-haspopup="listbox"
          aria-owns="search-suggestions"
          aria-activedescendant={showSuggestions && highlightedIndex >= 0 ? `suggestion-item-${highlightedIndex}` : undefined}
        >
          <input
            ref={inputRef}
            data-testid="search-input"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              // Base styles - rounded pill with dark theme
              "w-full h-12 rounded-full border-2 bg-card text-foreground",
              "pl-3 pr-24 py-3 text-sm placeholder:text-muted-foreground",
              "transition-all duration-200 ease-in-out",
              "focus:outline-none focus:ring-0 focus:border-white",
              "hover:border-white/30",
              // Light border color
              "border-white/20"
            )}
            aria-label="Search videos, films, and series"
            aria-describedby="search-help"
            aria-autocomplete="list"
          />

        </div>

        {/* Right side buttons container */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2  flex items-center gap-1">
          {/* Clear button - only show when there's a value */}
          {hasValue && !loading && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              data-testid="clear-button"
              className={cn(
                "h-7 w-7 rounded-full text-white/80",
                "hover:text-white hover:bg-white/20",
                "focus:ring-2 focus:ring-white/50 focus:ring-offset-0",
                "z-10 relative"
              )}
              aria-label="Clear search"
            >
              <X className="h-2.5 w-2.5" />
            </Button>
          )}

          {/* Loading spinner - show when loading */}
          {loading && (
            <div
              className="h-7 w-7 flex items-center justify-center text-muted-foreground"
              aria-hidden="true"
            >
              <div className="animate-spin rounded-full h-2.5 w-2.5 border-b-2 border-current"></div>
            </div>
          )}

          {/* Submit button */}
          <Button
    type="button"
    onClick={handleSubmit}
    disabled={loading}
    variant="default"
    // absolute so it sits on top of the pill and keeps its own bg
    className={cn(
      "h-8 w-8 rounded-full p-0",
      // make the background actually visible on dark UI
      hasValue
        ? "bg-red-600 border-white/14 hover:bg-red-700 text-white"
        : "bg-white/0 border-white/0 hover:bg-red-700",
      "border shadow-sm ",
      "text-white flex items-center justify-center",
      "transition-colors duration-200"
    )}
    aria-label="Submit search"
  >
    <Search className="!h-4 !w-4" strokeWidth={2.25} />
  </Button>
        </div>

        {/* Hidden help text for screen readers */}
        <div id="search-help" className="sr-only">
          Press Enter to search or Escape to clear
        </div>

        {/* Live region for screen reader announcements */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {showSuggestions && suggestions.length > 0 && (
            `${suggestions.length} ${isPopular ? 'popular' : 'search'} suggestion${suggestions.length === 1 ? '' : 's'} available`
          )}
        </div>

        {/* Suggestions list */}
        {showSuggestions && suggestions.length > 0 && (
          <SuggestionsList
            suggestions={suggestions}
            highlightedIndex={highlightedIndex}
            onSelect={handleSuggestionSelect}
            onHighlightChange={handleSuggestionHighlightChange}
            onClose={handleSuggestionsClose}
            isPopular={isPopular}
            anchorRef={containerRef as React.RefObject<HTMLElement>}
          />
        )}
      </div>
    )
  }
)

SearchBar.displayName = "SearchBar"
