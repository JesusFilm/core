import { useTranslation } from 'next-i18next'
import {
  FocusEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { useSearchBox } from 'react-instantsearch'

import { usePlayer } from '../../../libs/playerContext'
import { useTrendingSearches } from '../../../libs/useTrendingSearches'

export interface UseFloatingSearchOverlayResult {
  searchInputRef: React.RefObject<HTMLInputElement | null>
  overlayRef: React.RefObject<HTMLDivElement | null>
  isSearchActive: boolean
  hasQuery: boolean
  searchQuery: string
  searchValue: string
  loading: boolean
  isScrolled: boolean
  handleSearch: (query: string) => void
  handleSearchFocus: () => void
  handleSearchBlur: (
    event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void
  handleOverlayBlur: (event: FocusEvent<HTMLDivElement>) => void
  handleQuickSelect: (value: string) => void
  handleCloseSearch: () => void
  handleClearSearch: () => void
  trendingSearches: string[]
  isTrendingLoading: boolean
  isTrendingFallback: boolean
}

const POPULAR_SEARCH_LIMIT = 8
const SEARCH_IDLE_TIMEOUT = 1000

export function useFloatingSearchOverlay(): UseFloatingSearchOverlayResult {
  const { refine } = useSearchBox()
  const { t } = useTranslation('apps-watch')
  const { dispatch: dispatchPlayer } = usePlayer()
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchValue, setSearchValue] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const {
    trendingSearches,
    isLoading: isTrendingLoading,
    error: trendingError,
    fetchTrendingSearches
  } = useTrendingSearches(POPULAR_SEARCH_LIMIT)

  useEffect(() => {
    refine('')
  }, [refine])

  useEffect(() => {
    if (isSearchActive && searchInputRef.current) {
      const focusInput = () => {
        if (searchInputRef.current) {
          searchInputRef.current.focus()
          searchInputRef.current.click()
        }
      }

      focusInput()

      const timer1 = setTimeout(focusInput, 50)
      const timer2 = setTimeout(focusInput, 150)
      const timer3 = setTimeout(focusInput, 300)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    }
  }, [isSearchActive])

  useEffect(() => {
    if (!isSearchActive) return

    if (trendingSearches.length === 0 && !isTrendingLoading && !trendingError) {
      // fetchTrendingSearches handles errors internally
      fetchTrendingSearches()
    }
  }, [
    isSearchActive,
    trendingSearches.length,
    isTrendingLoading,
    trendingError,
    fetchTrendingSearches
  ])

  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current != null)
        clearTimeout(loadingTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    // Set initial state
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleSearchFocus = useCallback(() => {
    setIsSearchActive(true)
    dispatchPlayer({ type: 'SetPlay', play: false })
  }, [dispatchPlayer])

  const handleCloseSearch = useCallback(() => {
    setIsSearchActive(false)
    setSearchValue('')
    setSearchQuery('')
    refine('')
    dispatchPlayer({ type: 'SetPlay', play: true })
  }, [refine, dispatchPlayer])

  const handleClearSearch = useCallback(() => {
    setSearchValue('')
    setSearchQuery('')
    refine('')
    setIsSearching(false)
    requestAnimationFrame(() => {
      searchInputRef.current?.focus()
    })
  }, [refine])

  useEffect(() => {
    if (!isSearchActive) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        handleCloseSearch()
        searchInputRef.current?.blur()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSearchActive, handleCloseSearch])

  const handleSearch = useCallback(
    (query: string) => {
      if (loadingTimeoutRef.current != null) {
        clearTimeout(loadingTimeoutRef.current)
      }

      setIsSearching(true)
      setSearchQuery(query)
      setSearchValue(query)
      refine(query)

      loadingTimeoutRef.current = setTimeout(() => {
        setIsSearching(false)
      }, SEARCH_IDLE_TIMEOUT)
    },
    [refine]
  )

  const handleSearchBlur = useCallback(
    (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const nextTarget = event.relatedTarget as Node | null
      if (nextTarget != null && overlayRef.current?.contains(nextTarget)) return

      if (
        nextTarget &&
        ((nextTarget as Element).closest('[data-radix-popover-content]') ||
          (nextTarget as Element).closest('[role="combobox"]') ||
          (nextTarget as Element).closest('[cmdk-root]') ||
          (nextTarget as Element).closest('[data-slot="popover-content"]'))
      ) {
        return
      }

      handleCloseSearch()
    },
    [handleCloseSearch]
  )

  const handleOverlayBlur = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      const nextTarget = event.relatedTarget as Node | null
      if (
        nextTarget != null &&
        (overlayRef.current?.contains(nextTarget) ?? false)
      )
        return
      if (nextTarget === searchInputRef.current) return

      if (
        nextTarget &&
        ((nextTarget as Element).closest('[data-radix-popover-content]') ||
          (nextTarget as Element).closest('[role="combobox"]') ||
          (nextTarget as Element).closest('[cmdk-root]') ||
          (nextTarget as Element).closest('[data-slot="popover-content"]'))
      ) {
        return
      }

      handleCloseSearch()
    },
    [handleCloseSearch]
  )

  const handleQuickSelect = useCallback(
    (value: string) => {
      handleSearch(value)
      setIsSearchActive(true)
      requestAnimationFrame(() => {
        searchInputRef.current?.focus()
      })
    },
    [handleSearch]
  )

  const fallbackTrendingSearches = useMemo(() => {
    const result = t('popularSearches', { returnObjects: true }) as
      | string[]
      | undefined
    return Array.isArray(result) ? result : []
  }, [t])

  const trendingSearchList = useMemo(
    () => (trendingError ? fallbackTrendingSearches : trendingSearches),
    [trendingError, fallbackTrendingSearches, trendingSearches]
  )

  const hasQuery = searchQuery.trim().length > 0

  return {
    searchInputRef,
    overlayRef,
    isSearchActive,
    hasQuery,
    searchQuery,
    searchValue,
    loading: isSearching,
    isScrolled,
    handleSearch,
    handleSearchFocus,
    handleSearchBlur,
    handleOverlayBlur,
    handleQuickSelect,
    handleCloseSearch,
    handleClearSearch,
    trendingSearches: trendingSearchList,
    isTrendingLoading,
    isTrendingFallback: Boolean(trendingError)
  }
}
