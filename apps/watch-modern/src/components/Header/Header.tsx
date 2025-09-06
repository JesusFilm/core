"use client"

import { useState, useCallback, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Container } from '@/components/ui/container'
import { SearchBar } from '@/components/watch/search/SearchBar'
import { LanguageFilter } from '@/components/watch/search/LanguageFilter'
import { useInstantSearch, useSearchBox } from 'react-instantsearch'
import { VideoGrid } from '@/components/watch/home/VideoGrid'
import { PopularSearches } from '@/components/watch/search/PopularSearches'

import logo from './assets/jesusfilm-sign.svg'

export function Header() {
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [currentInputValue, setCurrentInputValue] = useState('')
  const [hasSubmitted, setHasSubmitted] = useState(false)

  // Search functionality from SearchHeader
  const { status } = useInstantSearch()
  const { query, refine } = useSearchBox()

  const isLoading = useMemo(() => status === 'loading' || status === 'stalled', [status])

  const handleSubmit = useCallback(
    (value: string) => {
      const shouldRefine = (value || '').trim() !== (query || '').trim()
      if (shouldRefine) refine(value)
      setIsSuggestionsOpen(false)
      setHasSubmitted(true)
    },
    [refine, query]
  )

  const handleFocus = useCallback(() => {
    setIsSuggestionsOpen(true)
    setIsSearchFocused(true)
  }, [])
  const handleBlur = useCallback(() => {
    setIsSearchFocused(false)
  }, [])
  const handleSuggestionsClose = useCallback(() => {
    setIsSuggestionsOpen(false)
  }, [])
  const handleValueChange = useCallback((val: string) => {
    setCurrentInputValue(val)
    if ((val || '').trim() === '') {
      setHasSubmitted(false)
      // Reset InstantSearch results when input is cleared
      refine('')
    }
  }, [refine])
  const handleClear = useCallback(() => {
    setCurrentInputValue('')
    setHasSubmitted(false)
    // Explicitly clear the InstantSearch query so grid resets
    refine('')
  }, [refine])

  // Keep currentInputValue in sync with InstantSearch query, so overlay reflects existing text
  useEffect(() => {
    setCurrentInputValue(query || '')
    // When query is set via refine (Enter/click submit or pill), mark as submitted
    if ((query || '').trim() !== '') setHasSubmitted(true)
  }, [query])


  return (
    <>
      <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
        <Container>
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src={logo}
                  alt="Jesus Film Project Logo"
                  className="h-8 w-auto"
                  priority
                />
              </Link>
            </div>

            {/* Search Field */}
            <div className="flex-1 max-w-lg mx-4">
              <SearchBar
                initialValue={query || ''}
                forceValue={query || ''}
                onSubmit={handleSubmit}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onSuggestionsClose={handleSuggestionsClose}
                onValueChange={handleValueChange}
                onClear={handleClear}
                loading={isLoading}
                placeholder="Search videos, films, and series..."
                isSuggestionsOpen={isSuggestionsOpen}
                className="flex-1"
              />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Language Filter */}
              <LanguageFilter />
            </div>
          </div>
        </Container>

        {/* Mobile Search */}
        <div className="md:hidden border-t border-white/10">
          <Container>
            <div className="py-4">
              <SearchBar
                initialValue={query || ''}
                forceValue={query || ''}
                onSubmit={handleSubmit}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onSuggestionsClose={handleSuggestionsClose}
                onValueChange={handleValueChange}
                onClear={handleClear}
                loading={isLoading}
                placeholder="Search videos, films, and series..."
                isSuggestionsOpen={isSuggestionsOpen}
                className="w-full"
              />
            </div>
          </Container>
        </div>
      </header>

      {/* Full-page overlay below header when search is focused or has text */}
      {(isSearchFocused || (currentInputValue || '').trim() !== '') && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md">
          {/* Offset for fixed header height */}
          <div className="pt-16 h-full overflow-y-auto">
            {!hasSubmitted && <PopularSearches />}
            <VideoGrid />
          </div>
        </div>
      )}
    </>
  )
}
