import { act, renderHook, waitFor } from '@testing-library/react'
import type { FocusEvent } from 'react'

let mockUseTrendingSearches: jest.Mock
let mockUseSearchBox: jest.Mock

jest.mock('../../../hooks/useTrendingSearches', () => ({
  useTrendingSearches: (...args: unknown[]) => mockUseTrendingSearches(...args)
}))

jest.mock('react-instantsearch', () => ({
  useSearchBox: (...args: unknown[]) => mockUseSearchBox(...args)
}))

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (key === 'popularSearches' && options?.returnObjects === true) {
        return ['Hope', 'Faith', 'Love']
      }
      return key
    }
  })
}))

import { useFloatingSearchOverlay } from './useFloatingSearchOverlay'

describe('useFloatingSearchOverlay', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSearchBox = jest.fn()
    mockUseTrendingSearches = jest.fn()
    mockUseSearchBox.mockReturnValue({ refine: jest.fn() })
    mockUseTrendingSearches.mockReturnValue({
      trendingSearches: [],
      isLoading: false,
      error: null,
      fetchTrendingSearches: jest.fn()
    })
  })

  it('keeps overlay open when focus moves inside dialog content', () => {
    const { result } = renderHook(() => useFloatingSearchOverlay())

    const overlayElement = document.createElement('div')
    const overlayChild = document.createElement('button')
    overlayElement.appendChild(overlayChild)

    act(() => {
      result.current.overlayRef.current = overlayElement
      result.current.handleSearchFocus()
    })

    act(() => {
      result.current.handleSearchBlur({
        relatedTarget: overlayChild
      } as unknown as FocusEvent<HTMLInputElement>)
    })

    expect(result.current.isSearchActive).toBe(true)
  })

  it('closes overlay when focus leaves the dialog', () => {
    const { result } = renderHook(() => useFloatingSearchOverlay())

    const overlayElement = document.createElement('div')
    const outsideElement = document.createElement('button')

    act(() => {
      result.current.overlayRef.current = overlayElement
      result.current.handleSearchFocus()
    })

    act(() => {
      result.current.handleOverlayBlur({
        relatedTarget: outsideElement
      } as unknown as FocusEvent<HTMLDivElement>)
    })

    expect(result.current.isSearchActive).toBe(false)
  })

  it('requests trending searches when the overlay opens', async () => {
    const fetchTrendingSearches = jest.fn()
    mockUseTrendingSearches.mockReturnValue({
      trendingSearches: [],
      isLoading: false,
      error: null,
      fetchTrendingSearches
    })

    const { result } = renderHook(() => useFloatingSearchOverlay())

    act(() => {
      result.current.handleSearchFocus()
    })

    await waitFor(() => {
      expect(fetchTrendingSearches).toHaveBeenCalled()
    })
  })

  it('uses translated fallback searches when trending fails', () => {
    mockUseTrendingSearches.mockReturnValue({
      trendingSearches: ['api'],
      isLoading: false,
      error: new Error('fail'),
      fetchTrendingSearches: jest.fn()
    })

    const { result } = renderHook(() => useFloatingSearchOverlay())

    expect(result.current.trendingSearches).toEqual(['Hope', 'Faith', 'Love'])
    expect(result.current.isTrendingFallback).toBe(true)
  })
})
