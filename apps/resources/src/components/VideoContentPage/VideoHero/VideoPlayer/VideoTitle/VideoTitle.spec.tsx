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
  it('should render the video title', () => {
    render(
      <PlayerProvider initialState={initialState}>
        <VideoTitle videoTitle="Test Video" showButton />
      </PlayerProvider>
    )
    expect(
      screen.getByRole('heading', { name: 'Test Video' })
    ).toBeInTheDocument()
  })

  it('should be visible when not playing', () => {
    render(
      <PlayerProvider initialState={initialState}>
        <VideoTitle videoTitle="Test Video" showButton />
      </PlayerProvider>
    )
    const container = screen.getByRole('heading', {
      name: 'Test Video'
    }).parentElement
    expect(container).toHaveClass('opacity-100')
    expect(container).not.toHaveClass('opacity-0')
  })

  it('should be visible when player is active', () => {
    const state = {
      ...initialState,
      play: false,
      active: true
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
    render(
      <PlayerProvider initialState={initialState}>
        <VideoTitle videoTitle="Test Video" showButton />
      </PlayerProvider>
    )
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument()
  })

  it('should not render play button when showButton is false', () => {
    const { container } = render(
      <PlayerProvider initialState={initialState}>
        <VideoTitle videoTitle="Test Video" showButton={false} />
      </PlayerProvider>
    )
    const button = container.querySelector('#play-button-lg')
    expect(button).not.toBeVisible()
  })

  it('should call onClick when play button is clicked', () => {
    const onClick = jest.fn()
    render(
      <PlayerProvider initialState={initialState}>
        <VideoTitle videoTitle="Test Video" showButton onClick={onClick} />
      </PlayerProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    expect(onClick).toHaveBeenCalled()
  })

  it('should show unmute button when muted', () => {
    const state = {
      ...initialState,
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
})
