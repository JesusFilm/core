import { fireEvent, render, screen, within } from '@testing-library/react'

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
    tracks: mockCaptionTracks,
    activeTrack: mockActiveTrack,
    onChange: mockOnChange
  })

  it('should render menu with all subtitle tracks', () => {
    render(
      <SubtitleMenu
        {...getDefaultProps()}
        tracks={mockCaptionTracks}
        activeTrack={mockActiveTrack}
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
        tracks={[]}
        activeTrack={undefined}
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
        tracks={[]}
        activeTrack={undefined}
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
        tracks={mockCaptionTracks}
        activeTrack={activeTrack}
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
        tracks={mockCaptionTracks}
        activeTrack={activeTrack}
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
        tracks={mockCaptionTracks}
        activeTrack={undefined}
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
        tracks={mockCaptionTracks}
        activeTrack={undefined}
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
        tracks={mockCaptionTracks}
        activeTrack={undefined}
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
        tracks={tracksWithoutLabels}
        activeTrack={undefined}
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
        tracks={tracksWithoutLabelsOrLanguage}
        activeTrack={undefined}
      />
    )

    expect(screen.queryByText('track1')).not.toBeInTheDocument()
  })

  it('should handle empty caption tracks array', () => {
    render(
      <SubtitleMenu
        {...getDefaultProps()}
        tracks={[]}
        activeTrack={undefined}
      />
    )

    expect(screen.getByText('No subtitles available')).toBeInTheDocument()
    expect(screen.queryByText('English')).not.toBeInTheDocument()
  })

  it('should handle undefined active track', () => {
    render(
      <SubtitleMenu
        {...getDefaultProps()}
        tracks={[]}
        activeTrack={undefined}
      />
    )

    const offMenuItem = screen.getByText('Off').closest('[role="menuitem"]')
    const checkIcon = offMenuItem?.querySelector('svg')
    expect(checkIcon).toBeInTheDocument()
  })

  it('should enable portal when fullscreen is false', () => {
    render(<SubtitleMenu {...getDefaultProps()} fullscreen={false} />)

    const menu = screen.getByRole('menu')
    expect(menu).toBeInTheDocument()

    // When portal is enabled, menu is rendered in document.body
    const menuInBody = document.body.contains(menu)
    expect(menuInBody).toBe(true)
  })

  it('should disable portal when fullscreen is true', () => {
    const TestContainer = () => (
      <div data-testid="fullscreen-container">
        <SubtitleMenu {...getDefaultProps()} fullscreen={true} />
      </div>
    )

    render(<TestContainer />)

    // When portal is disabled, menu may be in a hidden container
    // Check that menu exists in the DOM (even if hidden)
    const menu = screen.getByRole('menu', { hidden: true })
    expect(menu).toBeInTheDocument()

    // Menu items should still be accessible
    const menuWithin = within(menu)
    expect(menuWithin.getByText('Off')).toBeInTheDocument()
  })

  it('should default to portal enabled when fullscreen prop is not provided', () => {
    render(<SubtitleMenu {...getDefaultProps()} />)

    const menu = screen.getByRole('menu')
    expect(menu).toBeInTheDocument()

    // Default behavior should use portal (fullscreen defaults to false)
    const menuInBody = document.body.contains(menu)
    expect(menuInBody).toBe(true)
  })

  it('should render menu correctly in fullscreen mode', () => {
    render(
      <SubtitleMenu
        {...getDefaultProps()}
        fullscreen={true}
        tracks={mockCaptionTracks}
      />
    )

    // When portal is disabled, menu may be in a hidden container
    const menu = screen.getByRole('menu', { hidden: true })
    expect(menu).toBeInTheDocument()
    const menuWithin = within(menu)
    expect(menuWithin.getByText('Off')).toBeInTheDocument()
    expect(menuWithin.getByText('English')).toBeInTheDocument()
    expect(menuWithin.getByText('Spanish')).toBeInTheDocument()
  })

  it('should handle menu interactions correctly in fullscreen mode', () => {
    render(
      <SubtitleMenu
        {...getDefaultProps()}
        fullscreen={true}
        tracks={mockCaptionTracks}
      />
    )

    const menu = screen.getByRole('menu', { hidden: true })
    const menuWithin = within(menu)
    const englishMenuItem = menuWithin.getByText('English')
    fireEvent.click(englishMenuItem)

    expect(mockOnChange).toHaveBeenCalledWith('track1')
    expect(mockOnClose).toHaveBeenCalled()
  })
})
