import { fireEvent, render, screen, within } from '@testing-library/react'

import { VideoSettings } from '.'

describe('VideoSettings', () => {
  const mockPlayer = {
    qualityLevels: jest.fn().mockReturnValue({
      on: jest.fn(),
      off: jest.fn(),
      selectedIndex: 0,
      length: 3
    }),
    tech: jest.fn().mockReturnValue({
      name_: 'Html5',
      vhs: {
        mediaSource: {
          activeSourceBuffers: []
        },
        playlistController_: {
          fastQualityChange_: jest.fn()
        }
      }
    }),
    currentTime: jest.fn().mockReturnValue(0),
    duration: jest.fn().mockReturnValue(100),
    paused: jest.fn().mockReturnValue(false),
    pause: jest.fn(),
    play: jest.fn().mockResolvedValue(undefined)
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly settings button', () => {
    render(<VideoSettings player={mockPlayer as any} />)
    expect(screen.getByLabelText('video settings')).toBeInTheDocument()
  })

  it('opens settings menu on button click', () => {
    render(<VideoSettings player={mockPlayer as any} />)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('video settings'))
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  it('closes settings menu on escape key', () => {
    render(<VideoSettings player={mockPlayer as any} />)

    fireEvent.click(screen.getByLabelText('video settings'))
    expect(screen.getByRole('menu')).toBeInTheDocument()

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('shows when clicked', () => {
    render(<VideoSettings player={mockPlayer as any} />)

    fireEvent.click(screen.getByLabelText('video settings'))
    fireEvent.click(screen.getByText('Quality'))

    expect(screen.getByTestId('ArrowBackIosNewRoundedIcon')).toBeInTheDocument()
  })

  it('navigates to and from the quality menu', () => {
    render(<VideoSettings player={mockPlayer as any} />)

    fireEvent.click(screen.getByLabelText('video settings'))
    fireEvent.click(screen.getByText('Quality'))

    fireEvent.click(screen.getByTestId('ArrowBackIosNewRoundedIcon'))

    expect(screen.getAllByText('Quality')).toHaveLength(2)
  })

  it('shows default value for video quality', () => {
    render(<VideoSettings player={mockPlayer as any} />)

    fireEvent.click(screen.getByLabelText('video settings'))

    const menuItem = screen.getByText('Quality').closest('li')
    expect(menuItem).toBeInTheDocument()

    const qualityText = within(menuItem as HTMLElement).getByText('Auto')
    expect(qualityText).toBeInTheDocument()
  })
})
