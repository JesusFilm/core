import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { SubtitleMenu } from './SubtitleMenu'

// Mock the translation function
jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))

describe('SubtitleMenu', () => {
  let mockCaptionTracks: TextTrack[]
  let mockActiveTrack: TextTrack | undefined
  let mockOnChange: jest.Mock
  let mockOnClose: jest.Mock
  let mockAnchorEl: HTMLElement

  beforeEach(() => {
    jest.clearAllMocks()

    mockOnChange = jest.fn()
    mockOnClose = jest.fn()
    mockAnchorEl = document.createElement('div')

    mockCaptionTracks = [
      {
        id: 'track1',
        label: 'English',
        language: 'en',
        kind: 'subtitles',
        mode: 'hidden'
      } as TextTrack,
      {
        id: 'track2',
        label: 'Spanish',
        language: 'es',
        kind: 'subtitles',
        mode: 'hidden'
      } as TextTrack
    ]

    mockActiveTrack = undefined
  })

  const getDefaultProps = () => ({
    anchorEl: mockAnchorEl,
    open: true,
    onClose: mockOnClose,
    youtubeCaptionTracks: mockCaptionTracks,
    activeYoutubeTrack: mockActiveTrack,
    onChange: mockOnChange
  })

  it('should render menu with all subtitle tracks', () => {
    render(
      <SubtitleMenu
        {...getDefaultProps()}
        youtubeCaptionTracks={mockCaptionTracks}
        activeYoutubeTrack={mockActiveTrack}
      />
    )

    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getByText('Off')).toBeInTheDocument()
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('Spanish')).toBeInTheDocument()
  })

  it('should not render menu when closed', () => {
    render(<SubtitleMenu {...getDefaultProps()} open={false} />)

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('should show "No subtitles available" when no tracks', () => {
    render(
      <SubtitleMenu
        {...getDefaultProps()}
        youtubeCaptionTracks={[]}
        activeYoutubeTrack={undefined}
      />
    )

    expect(screen.getByText('No subtitles available')).toBeInTheDocument()
    const menuItem = screen
      .getByText('No subtitles available')
      .closest('[role="menuitem"]')
    expect(menuItem).toHaveAttribute('aria-disabled', 'true')
  })

  it('should show checkmark next to "Off" when no track is active', () => {
    render(
      <SubtitleMenu
        {...getDefaultProps()}
        youtubeCaptionTracks={[]}
        activeYoutubeTrack={undefined}
      />
    )

    const offMenuItem = screen.getByText('Off').closest('[role="menuitem"]')
    expect(offMenuItem).toBeInTheDocument()

    // Check for checkmark icon
    const checkIcon = offMenuItem?.querySelector('svg')
    expect(checkIcon).toBeInTheDocument()
  })

  it('should show checkmark next to active track', () => {
    const activeTrack = {
      ...mockCaptionTracks[0],
      mode: 'showing' as TextTrackMode
    }
    render(
      <SubtitleMenu
        {...getDefaultProps()}
        youtubeCaptionTracks={mockCaptionTracks}
        activeYoutubeTrack={activeTrack}
      />
    )

    const englishMenuItem = screen
      .getByText('English')
      .closest('[role="menuitem"]')
    expect(englishMenuItem).toBeInTheDocument()

    // Check for checkmark icon
    const checkIcon = englishMenuItem?.querySelector('svg')
    expect(checkIcon).toBeInTheDocument()
  })

  it('should not show checkmark next to inactive tracks', () => {
    const activeTrack = {
      ...mockCaptionTracks[0],
      mode: 'showing' as TextTrackMode
    }
    render(
      <SubtitleMenu
        {...getDefaultProps()}
        youtubeCaptionTracks={mockCaptionTracks}
        activeYoutubeTrack={activeTrack}
      />
    )

    const spanishMenuItem = screen
      .getByText('Spanish')
      .closest('[role="menuitem"]')
    expect(spanishMenuItem).toBeInTheDocument()

    // Should not have checkmark icon
    const checkIcon = spanishMenuItem?.querySelector('svg')
    expect(checkIcon).not.toBeInTheDocument()
  })

  it('should call onChange with null when "Off" is clicked', () => {
    render(
      <SubtitleMenu
        {...getDefaultProps()}
        youtubeCaptionTracks={mockCaptionTracks}
        activeYoutubeTrack={undefined}
      />
    )

    const offMenuItem = screen.getByText('Off')
    fireEvent.click(offMenuItem)

    expect(mockOnChange).toHaveBeenCalledWith(null)
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should call onChange with track ID when track is clicked', () => {
    render(
      <SubtitleMenu
        {...getDefaultProps()}
        youtubeCaptionTracks={mockCaptionTracks}
        activeYoutubeTrack={undefined}
      />
    )

    const englishMenuItem = screen.getByText('English')
    fireEvent.click(englishMenuItem)

    expect(mockOnChange).toHaveBeenCalledWith('track1')
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should display track label when available', () => {
    render(
      <SubtitleMenu
        {...getDefaultProps()}
        youtubeCaptionTracks={mockCaptionTracks}
        activeYoutubeTrack={undefined}
      />
    )

    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('Spanish')).toBeInTheDocument()
  })

  it('should not render a track when label is not available', () => {
    const tracksWithoutLabels = [
      {
        id: 'track1',
        language: 'en',
        kind: 'subtitles',
        mode: 'hidden'
      } as TextTrack
    ]

    render(
      <SubtitleMenu
        {...getDefaultProps()}
        youtubeCaptionTracks={tracksWithoutLabels}
        activeYoutubeTrack={undefined}
      />
    )

    expect(screen.queryByText('en')).not.toBeInTheDocument()
    expect(screen.getByText('Off')).toBeInTheDocument()
  })

  it('should not render menu item when label is null', () => {
    const tracksWithoutLabelsOrLanguage = [
      {
        id: 'track1',
        kind: 'subtitles',
        mode: 'hidden'
      } as TextTrack
    ]

    render(
      <SubtitleMenu
        {...getDefaultProps()}
        youtubeCaptionTracks={tracksWithoutLabelsOrLanguage}
        activeYoutubeTrack={undefined}
      />
    )

    expect(screen.queryByText('track1')).not.toBeInTheDocument()
  })

  it('should handle empty caption tracks array', () => {
    render(
      <SubtitleMenu
        {...getDefaultProps()}
        youtubeCaptionTracks={[]}
        activeYoutubeTrack={undefined}
      />
    )

    expect(screen.getByText('No subtitles available')).toBeInTheDocument()
    expect(screen.queryByText('English')).not.toBeInTheDocument()
  })

  it('should handle undefined active track', () => {
    render(
      <SubtitleMenu
        {...getDefaultProps()}
        youtubeCaptionTracks={[]}
        activeYoutubeTrack={undefined}
      />
    )

    const offMenuItem = screen.getByText('Off').closest('[role="menuitem"]')
    const checkIcon = offMenuItem?.querySelector('svg')
    expect(checkIcon).toBeInTheDocument()
  })
})
