"use client"

import React from 'react'
import { User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useInstantSearch, useSearchBox } from 'react-instantsearch'

import logo from './assets/jesusfilm-sign.svg'

import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { VideoGrid } from '@/components/watch/home/VideoGrid'
import { Languages } from '@/components/watch/search/Languages'
import { PopularSearches } from '@/components/watch/search/PopularSearches'
import { SearchBar } from '@/components/watch/search/SearchBar'

export function Header() {
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isOverlayClicked, setIsOverlayClicked] = useState(false)
  const [keepOverlayOpen, setKeepOverlayOpen] = useState(false)
  const [forceClearValue, setForceClearValue] = useState<string | null>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)

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
    setKeepOverlayOpen(true)
    // Reset any stale overlay-click flag when focusing input
    setIsOverlayClicked(false)
  }, [])
  const handleBlur = useCallback(() => {
    // Don't close overlay if user clicked inside it
    if (!isOverlayClicked) {
      setIsSearchFocused(false)
      setKeepOverlayOpen(false)
    }
    setIsOverlayClicked(false) // Reset the flag
  }, [isOverlayClicked])
  const handleSuggestionsClose = useCallback(() => {
    setIsSuggestionsOpen(false)
  }, [])
  const handleValueChange = useCallback((val: string) => {
    if ((val || '').trim() === '') {
      setHasSubmitted(false)
      // Reset InstantSearch results when input is cleared
      refine('')
      // Close overlay if input is empty and not focused
      if (!isSearchFocused) {
        setKeepOverlayOpen(false)
      }
    }
  }, [refine, isSearchFocused])
  const handleClear = useCallback(() => {
    setHasSubmitted(false)
    // Force the SearchBar to clear its input value
    setForceClearValue('')
    // Explicitly clear the InstantSearch query so grid resets
    refine('')
    // Close overlay when cleared
    setKeepOverlayOpen(false)
    // Ensure subsequent blur does not keep overlay open
    setIsOverlayClicked(false)
  }, [refine])

  // Reset forceClearValue when query changes (after clear is processed)
  useEffect(() => {
    if (forceClearValue === '' && (query || '') === '') {
      setForceClearValue(null)
    }
  }, [query, forceClearValue])

  // Use mousedown so the flag is set before input blur runs
  const handleOverlayMouseDown = useCallback(() => {
    setIsOverlayClicked(true)
    setKeepOverlayOpen(true)
    // Do not prevent default or stop propagation; allow inner controls and outside-click logic to work
    // Auto-clear the flag shortly after to avoid affecting unrelated future blurs (e.g., clear button)
    setTimeout(() => setIsOverlayClicked(false), 250)
  }, [])

  // Close overlay when clicking on the header (outside the SearchBar)
  const handleHeaderMouseDown = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const target = e.target as Node
    if (searchContainerRef.current && searchContainerRef.current.contains(target)) return
    setKeepOverlayOpen(false)
    setIsSearchFocused(false)
  }, [])

  // When query is set via refine (Enter/click submit or pill), mark as submitted
  useEffect(() => {
    if ((query || '').trim() !== '') {
      setHasSubmitted(true)
      setKeepOverlayOpen(true)
    }
  }, [query])

  return (
    <>
      <header onMouseDown={handleHeaderMouseDown} className="fixed top-0 z-50 w-full border-b border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
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
            <div ref={searchContainerRef} className="flex-1 max-w-lg mx-4">
              <SearchBar
                initialValue={query || ''}
                forceValue={forceClearValue !== null ? forceClearValue : (query || '')}
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
              {/* Account Button */}
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 rounded-full"
                aria-label="Account menu"
                onClick={() => {
                  // TODO: Implement account menu functionality
                  console.log('Account button clicked')
                }}
              >
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </Container>

        {/* Mobile Search */}
        <div className="md:hidden border-t border-white/10">
          <Container>
            <div className="py-4">
              <SearchBar
                initialValue={query || ''}
                forceValue={forceClearValue !== null ? forceClearValue : (query || '')}
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
      {(isSearchFocused || keepOverlayOpen) && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md" onMouseDown={handleOverlayMouseDown}>
          {/* Offset for fixed header height */}
          <div className="pt-16 h-full overflow-y-auto">

            {!hasSubmitted && (
              <>
                <div className="pt-8">
                  <PopularSearches />
                </div>
              </>
            )}
            {/* Language filter should always be visible */}
            <div className="pt-4">
              <Languages />
            </div>
            <VideoGrid />
          </div>
        </div>
      )}
    </>
  )
}
