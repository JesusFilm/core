"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { Search, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SuggestionItem } from "./types"

// Portal component for proper layering with positioning
const Portal = ({
  children,
  container,
  anchorRef
}: {
  children: React.ReactNode;
  container?: Element;
  anchorRef?: React.RefObject<HTMLElement>;
}) => {
  const [mountNode, setMountNode] = React.useState<Element | null>(null)
  const [position, setPosition] = React.useState<{ top: number; left: number; width: number } | null>(null)

  React.useEffect(() => {
    // Ensure we're on the client side
    if (typeof document === 'undefined') return

    const node = container || document.body
    setMountNode(node)
  }, [container])

  React.useEffect(() => {
    if (!anchorRef?.current || typeof window === 'undefined') return

    const updatePosition = () => {
      const rect = anchorRef.current!.getBoundingClientRect()
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      })
    }

    updatePosition()

    // Update position on resize and scroll
    const handleResize = () => updatePosition()
    const handleScroll = () => updatePosition()

    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll, true)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [anchorRef])

  // Don't render anything on the server
  if (typeof document === 'undefined' || !mountNode) return null

  const portalContent = position ? (
    <div
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        width: position.width,
        zIndex: 100
      }}
    >
      {children}
    </div>
  ) : null

  return createPortal(portalContent, mountNode)
}

export interface SuggestionsListProps {
  /** Array of suggestions to display */
  suggestions: SuggestionItem[]
  /** Currently highlighted suggestion index */
  highlightedIndex: number
  /** Called when a suggestion is selected */
  onSelect: (suggestion: SuggestionItem) => void
  /** Called when highlighted index changes */
  onHighlightChange: (index: number) => void
  /** Called when list should close */
  onClose: () => void
  /** Whether this is showing popular suggestions */
  isPopular?: boolean
  /** Reference to the anchor element for positioning */
  anchorRef?: React.RefObject<HTMLElement>
  /** Additional CSS classes */
  className?: string
}

/**
 * SuggestionsList component - Displays search suggestions with keyboard and mouse navigation
 *
 * Features:
 * - WAI-ARIA compliant (listbox/option roles)
 * - Keyboard navigation (Up/Down/Enter/Escape)
 * - Mouse interaction (click/hover)
 * - Highlighting of matched substrings
 * - Popular suggestions indicator
 * - Proper positioning and z-index
 *
 * @example
 * ```tsx
 * <SuggestionsList
 *   suggestions={suggestions}
 *   highlightedIndex={0}
 *   onSelect={(suggestion) => console.log('Selected:', suggestion)}
 *   onHighlightChange={(index) => setHighlightedIndex(index)}
 *   onClose={() => setIsOpen(false)}
 *   isPopular={true}
 * />
 * ```
 */
export const SuggestionsList = React.forwardRef<HTMLDivElement, SuggestionsListProps>(
  ({
    suggestions,
    highlightedIndex,
    onSelect,
    onHighlightChange,
    onClose,
    isPopular = false,
    anchorRef,
    className,
    ...props
  }, ref) => {
    const listRef = React.useRef<HTMLUListElement>(null)
    const [focusedIndex, setFocusedIndex] = React.useState(highlightedIndex)

    // Sync focused index with highlighted index
    React.useEffect(() => {
      setFocusedIndex(highlightedIndex)
    }, [highlightedIndex])

    // Handle keyboard navigation
    React.useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        console.log('🔍 SuggestionsList handleKeyDown called with key:', e.key, 'focusedIndex:', focusedIndex)
        switch (e.key) {
          case 'ArrowDown':
            console.log('🔍 ArrowDown key pressed')
            e.preventDefault()
            const nextIndex = Math.min(focusedIndex + 1, suggestions.length - 1)
            console.log('🔍 Moving focus to index:', nextIndex)
            setFocusedIndex(nextIndex)
            onHighlightChange(nextIndex)
            break
          case 'ArrowUp':
            console.log('🔍 ArrowUp key pressed')
            e.preventDefault()
            const prevIndex = Math.max(focusedIndex - 1, 0)
            console.log('🔍 Moving focus to index:', prevIndex)
            setFocusedIndex(prevIndex)
            onHighlightChange(prevIndex)
            break
          case 'Enter':
            console.log('🔍 Enter key pressed - selecting suggestion at index:', focusedIndex)
            e.preventDefault()
            if (suggestions[focusedIndex]) {
              console.log('🔍 Calling onSelect with suggestion:', suggestions[focusedIndex].text)
              onSelect(suggestions[focusedIndex])
            }
            break
          case 'Escape':
            console.log('🔍 Escape key pressed - closing suggestions')
            e.preventDefault()
            onClose()
            break
        }
      }

      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }, [focusedIndex, suggestions, onSelect, onHighlightChange, onClose])

    // Handle outside click to close
    React.useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (ref && 'current' in ref && ref.current && !ref.current.contains(e.target as Node)) {
          onClose()
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [onClose, ref])

    // Scroll highlighted item into view
    React.useEffect(() => {
      if (listRef.current && focusedIndex >= 0) {
        const focusedElement = listRef.current.children[focusedIndex] as HTMLElement
        if (focusedElement) {
          focusedElement.scrollIntoView({
            block: 'nearest',
            behavior: 'smooth'
          })
        }
      }
    }, [focusedIndex])

    // Handle mouse hover to update highlight
    const handleMouseEnter = React.useCallback((index: number) => {
      setFocusedIndex(index)
      onHighlightChange(index)
    }, [onHighlightChange])

    // Handle mouse click to select
    const handleClick = React.useCallback((suggestion: SuggestionItem) => {
      console.log('🔍 SuggestionsList handleClick called with suggestion:', suggestion)
      console.log('🔍 Calling onSelect with suggestion:', suggestion.text)
      onSelect(suggestion)
      console.log('🔍 onSelect call completed')
    }, [onSelect])

    // Render highlighted text with matched portions
    const renderHighlightedText = (suggestion: SuggestionItem) => {
      if (!suggestion.highlight) {
        return suggestion.text
      }

      const { match, original } = suggestion.highlight
      const matchIndex = original.toLowerCase().indexOf(match.toLowerCase())

      if (matchIndex === -1) {
        return suggestion.text
      }

      const beforeMatch = original.substring(0, matchIndex)
      const matchedText = original.substring(matchIndex, matchIndex + match.length)
      const afterMatch = original.substring(matchIndex + match.length)

      return (
        <>
          {beforeMatch}
          <mark className="bg-primary/20 text-primary font-medium">
            {matchedText}
          </mark>
          {afterMatch}
        </>
      )
    }

    if (suggestions.length === 0) {
      return null
    }

  return (
      <Portal anchorRef={anchorRef}>
        <div
          ref={ref}
          data-testid="suggestions-panel"
          className={cn(
            // Positioning and styling - Portal handles absolute positioning
            "mt-1",
            "bg-background/95 dark:bg-neutral-900/95 backdrop-blur-md",
            "border border-border rounded-xl shadow-xl",
            "max-h-80 overflow-y-auto",
            // Hide scrollbars while maintaining scroll functionality
            "scrollbar-hide",
            // Animation
            "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
            "duration-200 ease-out",
            className
          )}
          // Prevent the search input from blurring when interacting with
          // the suggestions panel so click selection remains reliable.
          onMouseDown={(e) => e.preventDefault()}
          onTouchStart={(e) => e.preventDefault()}
          {...props}
        >
        {/* Header for popular suggestions */}
        {isPopular && (
          <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground border-b border-border">
            <TrendingUp className="h-4 w-4" />
            <span>Popular searches</span>
          </div>
        )}

        {/* Suggestions list */}
        <ul
          ref={listRef}
          role="listbox"
          aria-label={isPopular ? "Popular search suggestions" : "Search suggestions"}
          className="py-1"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={`${suggestion.text}-${index}`}
              id={`suggestion-item-${index}`}
              data-testid={`suggestion-item-${index}`}
              role="option"
              aria-selected={index === focusedIndex}
              className={cn(
                // Base item styling
                "flex items-center gap-3 px-4 py-3 text-sm cursor-pointer",
                "hover:bg-accent hover:text-accent-foreground",
                "focus:outline-none focus:bg-accent focus:text-accent-foreground",
                // Selected/highlighted state
                index === focusedIndex && [
                  "bg-accent text-accent-foreground",
                  "ring-2 ring-ring ring-offset-0"
                ],
                // Transition
                "transition-colors duration-150 ease-in-out"
              )}
              onMouseEnter={() => handleMouseEnter(index)}
              // Select on mousedown/touchstart to avoid losing the event
              // due to the input's blur closing the panel.
              onMouseDown={(e) => {
                e.preventDefault()
                handleClick(suggestion)
              }}
              onTouchStart={(e) => {
                e.preventDefault()
                handleClick(suggestion)
              }}
            >
              {/* Search icon for each suggestion */}
              <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />

              {/* Suggestion text with highlighting */}
              <span className="flex-1 truncate">
                {renderHighlightedText(suggestion)}
              </span>

              {/* Optional metadata (future extension) */}
              {suggestion.metadata?.count && (
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {suggestion.metadata.count}
                </span>
              )}
            </li>
          ))}
        </ul>

        {/* Footer hint */}
        <div className="px-4 py-2 text-xs text-muted-foreground border-t border-border">
          <div className="flex items-center justify-between">
            <span>Use ↑↓ to navigate, Enter to select, Esc to close</span>
            {suggestions.length > 1 && (
              <span>{suggestions.length} suggestions</span>
            )}
          </div>
        </div>
      </div>
      </Portal>
    )
  }
)

SuggestionsList.displayName = "SuggestionsList"
