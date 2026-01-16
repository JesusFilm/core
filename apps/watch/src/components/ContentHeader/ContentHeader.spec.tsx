import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'

import {
  PlayerProvider,
  PlayerState
} from '../../libs/playerContext/PlayerContext'
import { VideoProvider } from '../../libs/videoContext'
import { videos } from '../Videos/__generated__/testData'

import { ContentHeader } from './ContentHeader'

let mockIsSearchActive = false
const mockHandleCloseSearch = jest.fn()

jest.mock('../SearchComponent/hooks/useFloatingSearchOverlay', () => ({
  useFloatingSearchOverlay: () => ({
    searchInputRef: { current: null },
    overlayRef: { current: null },
    isSearchActive: mockIsSearchActive,
    hasQuery: false,
    searchQuery: '',
    searchValue: '',
    loading: false,
    handleSearch: jest.fn(),
    handleSearchFocus: jest.fn(),
    handleSearchBlur: jest.fn(),
    handleOverlayBlur: jest.fn(),
    handleQuickSelect: jest.fn(),
    handleCloseSearch: mockHandleCloseSearch,
    handleClearSearch: jest.fn(),
    trendingSearches: [],
    isTrendingLoading: false,
    isTrendingFallback: false
  })
}))

jest.mock('@core/journeys/ui/algolia/SearchBarProvider', () => ({
  SearchBarProvider: ({ children }: { children: ReactNode }) => children
}))

jest.mock('../SearchComponent/SearchOverlay', () => ({
  SearchOverlay: () => null
}))

describe('ContentHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsSearchActive = false
  })

  it('renders the header with a logo', () => {
    const initialState: Partial<PlayerState> = {
      play: false,
      active: false,
      loading: false
    }
    render(
      <VideoProvider value={{ content: videos[0] }}>
        <PlayerProvider initialState={initialState}>
          <ContentHeader />
        </PlayerProvider>
      </VideoProvider>
    )

    const header = screen.getByRole('img', { name: 'Jesus Film Project' })
    expect(header).toBeInTheDocument()

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/')
  })

  it('shows close button and hides globe when search overlay is open', () => {
    mockIsSearchActive = true
    const initialState: Partial<PlayerState> = {
      play: false,
      active: false,
      loading: false
    }
    render(
      <VideoProvider value={{ content: videos[0] }}>
        <PlayerProvider initialState={initialState}>
          <ContentHeader />
        </PlayerProvider>
      </VideoProvider>
    )

    expect(screen.queryByTestId('AudioLanguageButton')).not.toBeInTheDocument()
  })

  it('should be visible when video is not playing', () => {
    const initialState: Partial<PlayerState> = {
      play: false,
      active: true,
      loading: false
    }
    render(
      <VideoProvider value={{ content: videos[0] }}>
        <PlayerProvider initialState={initialState}>
          <ContentHeader />
        </PlayerProvider>
      </VideoProvider>
    )
    expect(screen.getByTestId('ContentHeader')).toHaveClass('opacity-100')
  })

  it('should be hidden when video is playing and not active', () => {
    const initialState: Partial<PlayerState> = {
      play: true,
      active: false,
      loading: false
    }
    render(
      <VideoProvider value={{ content: videos[0] }}>
        <PlayerProvider initialState={initialState}>
          <ContentHeader />
        </PlayerProvider>
      </VideoProvider>
    )
    expect(screen.getByTestId('ContentHeader')).toHaveClass('opacity-0')
  })

  it('should be visible when video is playing and active', () => {
    const initialState: Partial<PlayerState> = {
      play: true,
      active: true,
      loading: false
    }
    render(
      <VideoProvider value={{ content: videos[0] }}>
        <PlayerProvider initialState={initialState}>
          <ContentHeader />
        </PlayerProvider>
      </VideoProvider>
    )
    expect(screen.getByTestId('ContentHeader')).toHaveClass('opacity-100')
  })

  it('should be visible when video is loading', () => {
    const initialState: Partial<PlayerState> = {
      play: false,
      active: false,
      loading: true
    }
    render(
      <VideoProvider value={{ content: videos[0] }}>
        <PlayerProvider initialState={initialState}>
          <ContentHeader />
        </PlayerProvider>
      </VideoProvider>
    )
    expect(screen.getByTestId('ContentHeader')).toHaveClass('opacity-100')
  })

  it('should have the correct href when languageSlug is provided', () => {
    const initialState: Partial<PlayerState> = {
      play: false,
      active: false,
      loading: false
    }
    render(
      <VideoProvider value={{ content: videos[0] }}>
        <PlayerProvider initialState={initialState}>
          <ContentHeader languageSlug="french" />
        </PlayerProvider>
      </VideoProvider>
    )
    expect(screen.getByRole('link')).toHaveAttribute('href', '/french.html')
  })

  it('should not change the href when languageSlug is english', () => {
    const initialState: Partial<PlayerState> = {
      play: false,
      active: false,
      loading: false
    }
    render(
      <VideoProvider value={{ content: videos[0] }}>
        <PlayerProvider initialState={initialState}>
          <ContentHeader languageSlug="english" />
        </PlayerProvider>
      </VideoProvider>
    )
    expect(screen.getByRole('link')).toHaveAttribute('href', '/')
  })

  it('should apply drop-shadow-xs class to Globe icon', () => {
    const initialState: Partial<PlayerState> = {
      play: false,
      active: false,
      loading: false
    }
    const { container } = render(
      <VideoProvider value={{ content: videos[0] }}>
        <PlayerProvider initialState={initialState}>
          <ContentHeader />
        </PlayerProvider>
      </VideoProvider>
    )

    const globeIcon = container.querySelector('.drop-shadow-xs')
    expect(globeIcon).toBeInTheDocument()
    expect(globeIcon).toHaveClass('drop-shadow-xs')
  })
})
