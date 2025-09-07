"use client"

import { Search as SearchIcon, Zap } from 'lucide-react'
import * as React from 'react'
import { useSearchBox } from 'react-instantsearch'

import { setSuggestionsAlgoliaClient, suggestionsClient } from './suggestionsClient'
import type { SuggestionItem } from './types'

import { useOptionalAlgoliaClient } from '@/components/providers/instantsearch'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { cn } from '@/lib/utils'

export function PopularSearches() {
  const algoliaCtx = useOptionalAlgoliaClient()
  const { refine } = useSearchBox()

  const [items, setItems] = React.useState<SuggestionItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const abortRef = React.useRef<AbortController | null>(null)

  // Use shared Algolia client for suggestions
  React.useEffect(() => {
    if (algoliaCtx?.searchClient) setSuggestionsAlgoliaClient(algoliaCtx.searchClient)
  }, [algoliaCtx?.searchClient])

  React.useEffect(() => {
    // Cancel previous
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    let mounted = true
    setLoading(true)
    suggestionsClient
      .fetchPopular({ limit: 10, signal: controller.signal })
      .then((suggestions) => {
        if (!mounted || controller.signal.aborted) return
        setItems(suggestions)
      })
      .catch(() => {
        // ignore; suggestionsClient already falls back
      })
      .finally(() => {
        if (mounted && !controller.signal.aborted) setLoading(false)
      })

    return () => {
      mounted = false
      controller.abort()
    }
  }, [])

  const handleClick = React.useCallback((text: string) => {
    // Submit query via InstantSearch
    refine(text)

    // Keep overlay open and reflect value by refocusing the header input
    try {
      const input = document.querySelector<HTMLInputElement>('input[data-testid="search-input"]')
      // Focus on next tick to avoid interfering with the click blur
      if (input) {
        // Small delay to ensure refine has completed
        setTimeout(() => {
          input.focus()
        }, 10)
      }
    } catch {}
  }, [refine])

  if (loading && items.length === 0) {
    return (
      <Container>
        <div className="py-4" />
      </Container>
    )
  }

  if (items.length === 0) return null

  return (
    <Container>
      <div className="py-3">
        <div
          className={cn(
            'flex items-center gap-2 overflow-x-auto whitespace-nowrap',
            '[-webkit-overflow-scrolling:touch]'
          )}
        >
          <div className="flex items-center text-white/90 text-sm font-medium flex-shrink-0 pr-1">
            <Zap className="h-4 w-4 mr-1.5" />
            <span>Popular searches</span>
          </div>

          {items.map((item, idx) => (
            <Button
              key={`${item.text}-${idx}`}
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => handleClick(item.text)}
              onMouseDown={(e) => {
                // Prevent input blur when clicking the pill so overlay stays open
                e.preventDefault()
              }}
              className={cn(
                'rounded-full px-3 py-1.5 h-8',
                'bg-white/10 hover:bg-white/20 text-white border border-white/15',
                'inline-flex items-center gap-1.5',
                'flex-shrink-0'
              )}
              aria-label={`Search for ${item.text}`}
            >
              <SearchIcon className="h-3.5 w-3.5" />
              <span className="text-sm font-normal">{item.text}</span>
            </Button>
          ))}
        </div>
      </div>
    </Container>
  )
}
