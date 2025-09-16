import { FocusEvent, ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import { useSearchBox } from 'react-instantsearch'

import { SearchBarProvider } from '@core/journeys/ui/algolia/SearchBarProvider'
import { SearchBar } from '@core/journeys/ui/SearchBar'

import { SearchOverlay } from './SearchOverlay'

interface HeaderSearchProps {
  languageId?: string
}

export function HeaderSearch({ languageId }: HeaderSearchProps): ReactElement {
  const { query, refine } = useSearchBox()
  const [isSearchActive, setIsSearchActive] = useState(false)
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  const trimmedQuery = query.trim()

  const handleSearchFocus = useCallback(() => {
    setIsSearchActive(true)
  }, [])

  const handleSearchBlur = useCallback(
    (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const nextTarget = event.relatedTarget as Node | null
      if (nextTarget != null && overlayRef.current?.contains(nextTarget)) return
      setIsSearchActive(false)
    },
    []
  )

  const handleOverlayBlur = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      const nextTarget = event.relatedTarget as Node | null
      if (nextTarget != null && (overlayRef.current?.contains(nextTarget) ?? false)) return
      if (nextTarget === searchInputRef.current) return
      setIsSearchActive(false)
    },
    []
  )

  const handleQuickSelect = useCallback(
    (value: string) => {
      refine(value)
      setIsSearchActive(true)
      requestAnimationFrame(() => {
        searchInputRef.current?.focus()
      })
    },
    [refine]
  )

  useEffect(() => {
    if (!isSearchActive) return

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        event.preventDefault()
        setIsSearchActive(false)
        searchInputRef.current?.blur()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSearchActive])

  return (
    <SearchBarProvider>
      <>
        <div className="w-full max-w-[720px]">
          <SearchBar
            showDropdown
            showLanguageButton
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            props={{ inputRef: searchInputRef }}
          />
        </div>
        <SearchOverlay
          open={isSearchActive}
          hasQuery={trimmedQuery.length > 0}
          onBlur={handleOverlayBlur}
          onSelectQuickValue={handleQuickSelect}
          containerRef={overlayRef}
          languageId={languageId}
        />
      </>
    </SearchBarProvider>
  )
}
