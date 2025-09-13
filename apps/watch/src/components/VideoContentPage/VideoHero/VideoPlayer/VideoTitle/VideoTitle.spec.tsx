import { fireEvent, render, screen } from '@testing-library/react'

import {
  PlayerProvider,
  playerInitialState
} from '../../../../../libs/playerContext'
import { VideoProvider } from '../../../../../libs/videoContext'
import { videos } from '../../../../Videos/__generated__/testData'

import { VideoTitle } from './VideoTitle'

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (str: string) => str
  })
}))

const initialState = playerInitialState
const mockVideo = videos[0] // Use first video from test data

const renderWithProviders = (
  ui: React.ReactElement,
  playerState = initialState
) => {
  return render(
    <VideoProvider value={{ content: mockVideo }}>
      <PlayerProvider initialState={playerState}>{ui}</PlayerProvider>
    </VideoProvider>
  )
}

describe('VideoTitle', () => {
  it('should render the video title', () => {
    renderWithProviders(<VideoTitle videoTitle="Test Video" showButton />)
    expect(
      screen.getByRole('heading', { name: 'Test Video' })
    ).toBeInTheDocument()
  })

  it('should be visible when not playing', () => {
    renderWithProviders(<VideoTitle videoTitle="Test Video" showButton />)
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
    renderWithProviders(
      <VideoTitle videoTitle="Test Video" showButton />,
      state
    )
    const container = screen.getByRole('heading', {
      name: 'Test Video'
    }).parentElement
    expect(container).toHaveClass('opacity-100')
    expect(container).not.toHaveClass('opacity-0')
  })

  it('should render play button', () => {
    renderWithProviders(<VideoTitle videoTitle="Test Video" showButton />)
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument()
  })

  it('should not render play button when showButton is false', () => {
    const { container } = renderWithProviders(
      <VideoTitle videoTitle="Test Video" showButton={false} />
    )
    const button = container.querySelector('#play-button-lg')
    expect(button).toBeNull()
  })

  it('should call onClick when play button is clicked', () => {
    const onClick = jest.fn()
    renderWithProviders(
      <VideoTitle videoTitle="Test Video" showButton onClick={onClick} />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    expect(onClick).toHaveBeenCalled()
  })

  it('should show unmute button when muted', () => {
    const state = {
      ...initialState,
      mute: true
    }
    renderWithProviders(
      <VideoTitle videoTitle="Test Video" showButton variant="unmute" />,
      state
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
    renderWithProviders(
      <VideoTitle
        videoTitle="Test Video"
        showButton
        variant="unmute"
        onClick={onClick}
      />,
      state
    )
    fireEvent.click(screen.getByRole('button', { name: 'Play with sound' }))
    expect(onClick).toHaveBeenCalled()
  })
})
