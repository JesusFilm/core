import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from 'storybook/test'

import {
  PlayerProvider,
  PlayerState
} from '../../../../libs/playerContext/PlayerContext'
import { VideoProvider } from '../../../../libs/videoContext'
import { videos } from '../../../Videos/__generated__/testData'

import { ContentHeader } from './ContentHeader'

describe('ContentHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the header with a logo', () => {
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
      expect(screen.getByRole('combobox')).toHaveValue('English')
    )
  })
})
