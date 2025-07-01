import { fireEvent, render, screen } from '@testing-library/react'

import {
  WatchProvider,
  videoPlayerInitialState
} from '../../../../../libs/watchContext'

import { VideoTitle } from './VideoTitle'

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (str: string) => str
  })
}))

const initialState = {
  siteLanguage: 'en',
  audioLanguage: 'en',
  subtitleLanguage: 'en',
  subtitleOn: true,
  player: videoPlayerInitialState
}

describe('VideoTitle', () => {
  it('should render the video title', () => {
    render(
      <WatchProvider initialState={initialState}>
        <VideoTitle videoTitle="Test Video" showButton />
      </WatchProvider>
    )
    expect(
      screen.getByRole('heading', { name: 'Test Video' })
    ).toBeInTheDocument()
  })

  it('should be visible when not playing', () => {
    render(
      <WatchProvider initialState={initialState}>
        <VideoTitle videoTitle="Test Video" showButton />
      </WatchProvider>
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
      player: { ...initialState.player, play: false, active: true }
    }
    render(
      <WatchProvider initialState={state}>
        <VideoTitle videoTitle="Test Video" showButton />
      </WatchProvider>
    )
    const container = screen.getByRole('heading', {
      name: 'Test Video'
    }).parentElement
    expect(container).toHaveClass('opacity-100')
    expect(container).not.toHaveClass('opacity-0')
  })

  it('should render play button', () => {
    render(
      <WatchProvider initialState={initialState}>
        <VideoTitle videoTitle="Test Video" showButton />
      </WatchProvider>
    )
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument()
  })

  it('should not render play button when showButton is false', () => {
    const { container } = render(
      <WatchProvider initialState={initialState}>
        <VideoTitle videoTitle="Test Video" showButton={false} />
      </WatchProvider>
    )
    const button = container.querySelector('#play-button-lg')
    expect(button).not.toBeVisible()
  })

  it('should call onClick when play button is clicked', () => {
    const onClick = jest.fn()
    render(
      <WatchProvider initialState={initialState}>
        <VideoTitle videoTitle="Test Video" showButton onClick={onClick} />
      </WatchProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    expect(onClick).toHaveBeenCalled()
  })

  it('should show unmute button when muted', () => {
    const state = {
      ...initialState
    }
    render(
      <WatchProvider initialState={state}>
        <VideoTitle videoTitle="Test Video" showButton variant="unmute" />
      </WatchProvider>
    )
    expect(
      screen.getByRole('button', { name: 'Play with sound' })
    ).toBeInTheDocument()
  })

  it('should call onClick when unmute button is clicked', () => {
    const onClick = jest.fn()
    const state = {
      ...initialState,
      player: { ...initialState.player, mute: true }
    }
    render(
      <WatchProvider initialState={state}>
        <VideoTitle
          videoTitle="Test Video"
          showButton
          variant="unmute"
          onClick={onClick}
        />
      </WatchProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Play with sound' }))
    expect(onClick).toHaveBeenCalled()
  })
})
