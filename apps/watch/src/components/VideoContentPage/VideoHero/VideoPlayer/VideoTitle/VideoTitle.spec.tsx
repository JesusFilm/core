import { fireEvent, render, screen } from '@testing-library/react'

import {
  PlayerProvider,
  playerInitialState
} from '../../../../../libs/playerContext'

import { VideoTitle } from './VideoTitle'

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (str: string) => str
  })
}))

const initialState = playerInitialState

describe('VideoTitle', () => {
  it('should show unmute button when playing muted', () => {
    const state = {
      ...initialState,
      play: true,
      mute: true
    }
    render(
      <PlayerProvider initialState={state}>
        <VideoTitle videoTitle="Test Video" showButton variant="unmute" />
      </PlayerProvider>
    )
    expect(
      screen.getByRole('button', { name: 'Play with sound' })
    ).toBeInTheDocument()
  })

  it('should call onClick when unmute button is clicked', () => {
    const onClick = jest.fn()
    const state = {
      ...initialState,
      play: true,
      mute: true
    }
    render(
      <PlayerProvider initialState={state}>
        <VideoTitle
          videoTitle="Test Video"
          showButton
          variant="unmute"
          onClick={onClick}
        />
      </PlayerProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Play with sound' }))
    expect(onClick).toHaveBeenCalled()
  })

  it('should render play button', () => {
    const state = {
      ...initialState,
      play: true,
      mute: true
    }
    render(
      <PlayerProvider initialState={state}>
        <VideoTitle videoTitle="Test Video" showButton />
      </PlayerProvider>
    )
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument()
  })

  it('should not render play button when showButton is false', () => {
    const state = {
      ...initialState,
      play: true,
      mute: true
    }
    const { container } = render(
      <PlayerProvider initialState={{ ...initialState, mute: true }}>
        <VideoTitle videoTitle="Test Video" showButton={false} />
      </PlayerProvider>
    )
    const button = container.querySelector('#play-button-lg')
    expect(button).toHaveClass('opacity-0')
  })

  it('should call onClick when play button is clicked', () => {
    const onClick = jest.fn()
    const state = {
      ...initialState,
      play: true,
      mute: true
    }
    render(
      <PlayerProvider initialState={state}>
        <VideoTitle videoTitle="Test Video" showButton onClick={onClick} />
      </PlayerProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    expect(onClick).toHaveBeenCalled()
  })

  it('should be visible when video is playing muted (preview mode)', () => {
    const state = {
      ...initialState,
      play: true,
      mute: true,
      active: false,
      loading: false
    }
    render(
      <PlayerProvider initialState={state}>
        <VideoTitle videoTitle="Test Video" showButton />
      </PlayerProvider>
    )
    const container = screen.getByRole('heading', {
      name: 'Test Video'
    }).parentElement
    expect(container).toHaveClass('opacity-100')
    expect(container).not.toHaveClass('opacity-0')
  })

  // New tests for variant='unmute' logic
  it('should show the title for variant unmute when muted', () => {
    render(
      <PlayerProvider initialState={{ ...initialState, mute: true }}>
        <VideoTitle videoTitle="Test Video" showButton variant="unmute" />
      </PlayerProvider>
    )
    expect(screen.getByTestId('video-title')).toHaveClass('opacity-100')
  })

  it('should show the title for variant unmute when volume is 0', () => {
    render(
      <PlayerProvider
        initialState={{ ...initialState, mute: false, volume: 0 }}
      >
        <VideoTitle videoTitle="Test Video" showButton variant="unmute" />
      </PlayerProvider>
    )
    expect(screen.getByTestId('video-title')).toHaveClass('opacity-100')
  })

  it('should hide the title for variant unmute when not muted and volume > 0', () => {
    render(
      <PlayerProvider
        initialState={{ ...initialState, mute: false, volume: 1 }}
      >
        <VideoTitle videoTitle="Test Video" showButton variant="unmute" />
      </PlayerProvider>
    )
    expect(screen.getByTestId('video-title')).toHaveClass('opacity-0')
  })
})
