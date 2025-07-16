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
  it('should render the video title in preview mode', () => {
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
    expect(
      screen.getByRole('heading', { name: 'Test Video' })
    ).toBeInTheDocument()
  })

  it('should not render the video title when not in preview mode', () => {
    render(
      <PlayerProvider initialState={initialState}>
        <VideoTitle videoTitle="Test Video" showButton />
      </PlayerProvider>
    )
    expect(
      screen.queryByRole('heading', { name: 'Test Video' })
    ).not.toBeInTheDocument()
  })

  it('should be visible when in preview mode (play && mute)', () => {
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
    const container = screen.getByRole('heading', {
      name: 'Test Video'
    }).parentElement
    expect(container).toHaveClass('opacity-100')
    expect(container).not.toHaveClass('opacity-0')
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
      <PlayerProvider initialState={state}>
        <VideoTitle videoTitle="Test Video" showButton={false} />
      </PlayerProvider>
    )
    const button = container.querySelector('#play-button-lg')
    expect(button).not.toBeVisible()
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

  it('should show unmute button when muted', () => {
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

  it('should be hidden when video is playing with sound (not muted)', () => {
    const state = {
      ...initialState,
      play: true,
      mute: false,
      active: false,
      loading: false
    }
    render(
      <PlayerProvider initialState={state}>
        <VideoTitle videoTitle="Test Video" showButton />
      </PlayerProvider>
    )
    expect(
      screen.queryByRole('heading', { name: 'Test Video' })
    ).not.toBeInTheDocument()
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
})
