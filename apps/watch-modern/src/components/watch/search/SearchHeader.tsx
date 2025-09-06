"use client"

import { memo, useCallback, useMemo, useState } from 'react'
import { Container } from '@/components/ui/container'
import { SearchBar } from '@/components/watch/search/SearchBar'
import { LanguageFilter } from '@/components/watch/search/LanguageFilter'
import { useInstantSearch, useSearchBox } from 'react-instantsearch'

// Reusable search controls rendered below the site header
export const SearchHeader = memo(function SearchHeader() {
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false)
  const { status } = useInstantSearch()
  const { query, refine } = useSearchBox()

  const isLoading = useMemo(() => status === 'loading' || status === 'stalled', [status])

  const handleSubmit = useCallback(
    (value: string) => {
      const shouldRefine = (value || '').trim() !== (query || '').trim()
      if (shouldRefine) refine(value)
      setIsSuggestionsOpen(false)
    },
    [refine, query]
  )

  const handleFocus = useCallback(() => setIsSuggestionsOpen(true), [])
  const handleSuggestionsClose = useCallback(() => setIsSuggestionsOpen(false), [])

  return (
    <section className="py-4 border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-16 z-30">
      <Container>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <SearchBar
            initialValue={query || ''}
            onSubmit={handleSubmit}
            onFocus={handleFocus}
            onSuggestionsClose={handleSuggestionsClose}
            loading={isLoading}
            placeholder="Search videos, films, and series..."
            isSuggestionsOpen={isSuggestionsOpen}
            className="flex-1 min-w-[280px]"
          />
          <div className="flex-shrink-0">
            <LanguageFilter />
          </div>
        </div>
      </Container>
    </section>
  )
})

