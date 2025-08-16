import { MockedProvider } from '@apollo/client/testing'
import { userEvent } from '@storybook/test'
import { render, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/router'

import {
  PlayerProvider,
  PlayerState
} from '../../../../libs/playerContext/PlayerContext'
import { VideoProvider } from '../../../../libs/videoContext'
import { videos } from '../../../Videos/__generated__/testData'

import { ContentHeader } from './ContentHeader'

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

describe('ContentHeader', () => {
  const mockUseRouter = useRouter as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    // Default mock for useRouter
    mockUseRouter.mockReturnValue({
      pathname: '/watch',
      asPath: '/watch'
    })
  })

  it('renders the header with a logo for default path', () => {
    render(
      <VideoProvider value={{ content: videos[0] }}>
        <ContentHeader />
      </VideoProvider>
    )

    const header = screen.getByRole('img', { name: 'JesusFilm Project' })
    expect(header).toBeInTheDocument()

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/watch')
  })

  it('renders the header with a logo linking to language-specific page for inner pages with language slug', () => {
    mockUseRouter.mockReturnValue({
      pathname: '/ru/watch/jesus-calms-the-storm.html/russian.html',
      asPath: '/watch/jesus-calms-the-storm.html/russian.html'
    })

    render(
      <VideoProvider value={{ content: videos[0] }}>
        <ContentHeader />
      </VideoProvider>
    )

    const header = screen.getByRole('img', { name: 'JesusFilm Project' })
    expect(header).toBeInTheDocument()

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/watch/russian.html')
  })

  it('renders the header with a logo linking to /watch when router is not available (SSR)', () => {
    mockUseRouter.mockReturnValue({
      pathname: '/watch/some-video.html',
      asPath: undefined
    })

    render(
      <VideoProvider value={{ content: videos[0] }}>
        <ContentHeader />
      </VideoProvider>
    )

    const header = screen.getByRole('img', { name: 'JesusFilm Project' })
    expect(header).toBeInTheDocument()

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/watch')
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

  it('opens audio language dialog on language button click', async () => {
    render(
      <MockedProvider>
        <VideoProvider value={{ content: videos[0] }}>
          <ContentHeader />
        </VideoProvider>
      </MockedProvider>
    )
    const user = userEvent.setup()

    await user.click(screen.getByTestId('LanguageOutlinedIcon'))

    await waitFor(() =>
      expect(screen.getByLabelText('Language Settings')).toBeInTheDocument()
    )
  })
})
