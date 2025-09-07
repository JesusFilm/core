"use client"

import { Search, X } from "lucide-react"
import * as React from "react"

import { setSuggestionsAlgoliaClient, suggestionsClient } from "./suggestionsClient"
import { SuggestionsList } from "./SuggestionsList"
import type { SuggestionItem } from "./types"

import { useOptionalAlgoliaClient } from '@/components/providers/instantsearch'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
      // Don't override input value if user is actively interacting
      if (!isUserInteractingRef.current && initialValue !== inputValue) {
        setInputValue(initialValue)
        // Inform parent so overlay can reflect initial value state
        onValueChange?.(initialValue)

        // If initialValue is empty (cleared externally), also clear suggestions
        if (!initialValue || initialValue.trim() === '') {
          setShowSuggestions(false)
          setSuggestions([])
          setHighlightedIndex(-1)
        }
      }
    }, [initialValue, inputValue, onValueChange])

    // Force sync from external value (e.g., clicking a Popular Search pill)
    React.useEffect(() => {
      if (typeof forceValue === 'undefined') {
        return
      }

      // Only force sync if we're not currently interacting (to avoid conflicts with direct clearing)
      const shouldForceSync = forceValue !== inputValue && !isUserInteractingRef.current

      if (shouldForceSync) {
        setInputValue(forceValue)
        onValueChange?.(forceValue)
      }
    }, [forceValue, inputValue, onValueChange])

    // Fetch suggestions based on current value
    const fetchSuggestions = React.useCallback(async (query: string) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController()
      const localController = abortControllerRef.current
      const localSignal = localController.signal

      try {
        // Do not show popular suggestions in dropdown; only show typed suggestions
        const trimmed = query.trim()
        if (trimmed.length === 0) {
          if (abortControllerRef.current === localController && !localSignal.aborted) {
            setSuggestions([])
            setHighlightedIndex(-1)
          }
          return
        }

        // Show typed suggestions
        const fetchedSuggestions: SuggestionItem[] = await suggestionsClient.fetchSuggestions(trimmed, {
          signal: localSignal
        })

        // Only update if this request is still the latest and wasn't aborted
        if (abortControllerRef.current === localController && !localSignal.aborted) {
          setSuggestions(fetchedSuggestions)
          setHighlightedIndex(-1) // Reset highlight
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError' && abortControllerRef.current === localController) {
          console.error('Failed to fetch suggestions:', error)
        }
      }
    }, [onValueChange, onClear])

    // Handle input change
    const handleInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      isUserInteractingRef.current = true
      setInputValue(newValue)
      onValueChange?.(newValue)

      // Fetch suggestions for the new value
      if (showSuggestions) {
        fetchSuggestions(newValue)
      }

      // Reset interaction flag after a short delay
      setTimeout(() => {
        isUserInteractingRef.current = false
      }, 100)
    }, [showSuggestions, fetchSuggestions])

    // Handle input focus
    const handleFocus = React.useCallback(() => {
      onFocus?.()

      // Show suggestions on focus
      setShowSuggestions(true)
      // Clear current list immediately to avoid stale highlights
      setSuggestions([])
      if (skipNextFocusFetchRef.current) {
        skipNextFocusFetchRef.current = false
      } else {
        // Only fetch typed suggestions; do not fetch popular on empty input
        if (inputValue.trim().length > 0) {
          fetchSuggestions(inputValue)
        }
      }
    }, [onFocus, inputValue, fetchSuggestions])

    // Handle input blur with delay to allow suggestion clicks
    const handleBlur = React.useCallback(() => {
      // Notify parent immediately that input lost focus
      onBlur?.()
      // Delay blur to allow suggestion clicks
      setTimeout(() => {
        setShowSuggestions(false)
        setSuggestions([])
        setHighlightedIndex(-1)
        onSuggestionsClose?.()
      }, 150)
    }, [onSuggestionsClose, onBlur])

    // Handle key down events
    const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        if (showSuggestions && suggestions[highlightedIndex]) {
          // Select highlighted suggestion
          handleSuggestionSelect(suggestions[highlightedIndex])
        } else {
          // Submit current input value
          onSubmit(inputValue)
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        if (showSuggestions) {
          // Close suggestions
          setShowSuggestions(false)
          setSuggestions([])
          setHighlightedIndex(-1)
          // Notify parent so overlays can close too
          onSuggestionsClose?.()
        } else {
          // Clear input and blur
          setInputValue('')
          onValueChange?.('')
          onClear?.()
          inputRef.current?.blur()
        }
      } else if (e.key === 'ArrowDown' && showSuggestions && suggestions.length > 0) {
        e.preventDefault()
        const nextIndex = highlightedIndex < suggestions.length - 1 ? highlightedIndex + 1 : 0
        setHighlightedIndex(nextIndex)
      } else if (e.key === 'ArrowUp' && showSuggestions && suggestions.length > 0) {
        e.preventDefault()
        const prevIndex = highlightedIndex > 0 ? highlightedIndex - 1 : suggestions.length - 1
        setHighlightedIndex(prevIndex)
      }
    }, [inputValue, onSubmit, showSuggestions, suggestions, highlightedIndex])

    // Handle suggestion selection
    const handleSuggestionSelect = React.useCallback((suggestion: SuggestionItem) => {
      isUserInteractingRef.current = true
      setInputValue(suggestion.text)
      onValueChange?.(suggestion.text)
      onSubmit(suggestion.text)
      setShowSuggestions(false)
      setSuggestions([])
      setHighlightedIndex(-1)
      inputRef.current?.blur()

      // Reset interaction flag after submit completes
      setTimeout(() => {
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
      onValueChange?.(inputValue)
      onSubmit(inputValue)
    }, [inputValue, onSubmit])

    // Handle clear button click - Directly clear input and notify parent
    const handleClear = React.useCallback(() => {
      // Prevent multiple rapid clicks
      if (isUserInteractingRef.current) {
        return
      }

      // Mark as interacting to prevent race conditions
      isUserInteractingRef.current = true

      // Clear the input value immediately
      const newValue = ''
      setInputValue(newValue)

      // Notify parent about the value change immediately
      onValueChange?.(newValue)

      // Close suggestions and reset state synchronously
      setShowSuggestions(false)
      setSuggestions([])
      setHighlightedIndex(-1)

      // Cancel any in-flight requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }

      // Reset interaction flag after a brief delay
      setTimeout(() => {
        isUserInteractingRef.current = false
      }, 100)

      // Notify parent that clear happened
      onClear?.()

      // Blur input immediately for better UX
      inputRef.current?.blur()
    }, [onClear, onValueChange])

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
              onMouseDown={(e) => {
                e.preventDefault() // Prevent input blur
              }}
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
