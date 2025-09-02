import { act, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { QualityMenu, QualityMenuItem } from '.'

describe('QualityMenu', () => {
  const mockPlayer = {
    qualityLevels: jest.fn().mockReturnValue({
      on: jest.fn(),
      off: jest.fn(),
      selectedIndex: 0,
      length: 3,
      0: { enabled: true, height: 720 },
      1: { enabled: true, height: 480 },
      2: { enabled: true, height: 360 }
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

  const anchorEl = document.createElement('button')
  const handleClose = jest.fn()
  const handleBack = jest.fn()
  const handleQualityChanged = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the quality menu when open', () => {
    act(() => {
      render(
        <QualityMenu
          anchorEl={anchorEl}
          open
          onClose={handleClose}
          onBack={handleBack}
          player={mockPlayer as any}
          onQualityChanged={handleQualityChanged}
        />
      )
    })

    expect(screen.getByText('Quality')).toBeInTheDocument()
    expect(screen.getByText('Auto')).toBeInTheDocument()
  })

  it('does not render the menu when closed', () => {
    render(
      <QualityMenu
        anchorEl={anchorEl}
        open={false}
        onClose={handleClose}
        onBack={handleBack}
        player={mockPlayer as any}
        onQualityChanged={handleQualityChanged}
      />
    )

    expect(screen.queryByText('Quality')).not.toBeInTheDocument()
    expect(screen.queryByText('Auto')).not.toBeInTheDocument()
  })

  it('calls onBack when back button is clicked', () => {
    act(() => {
      render(
        <QualityMenu
          anchorEl={anchorEl}
          open
          onClose={handleClose}
          onBack={handleBack}
          player={mockPlayer as any}
          onQualityChanged={handleQualityChanged}
        />
      )
    })

    act(() => {
      fireEvent.click(screen.getByText('Quality'))
    })
    expect(handleBack).toHaveBeenCalledTimes(1)
  })

  it('calls handleQualityChange when a quality option is clicked', async () => {
    jest
      .spyOn(React, 'useState')
      .mockImplementationOnce(() => [
        [
          {
            resolution: 'Auto',
            qualityLevel: -1,
            height: Number.MAX_SAFE_INTEGER
          },
          { resolution: '720p', qualityLevel: 0, height: 720 },
          { resolution: '480p', qualityLevel: 1, height: 480 },
          { resolution: '360p', qualityLevel: 2, height: 360 }
        ] as QualityMenuItem[],
        jest.fn()
      ])
      .mockImplementationOnce(() => [-1, jest.fn()])

    act(() => {
      render(
        <QualityMenu
          anchorEl={anchorEl}
          open
          onClose={handleClose}
          onBack={handleBack}
          player={mockPlayer as any}
          onQualityChanged={handleQualityChanged}
        />
      )
    })

    await act(async () => {
      fireEvent.click(screen.getByText('720p'))
      // Wait for the timeout in handleQualityChange to complete
      await new Promise((resolve) => setTimeout(resolve, 200))
    })

    expect(mockPlayer.pause).toHaveBeenCalled()
    expect(mockPlayer.currentTime).toHaveBeenCalled()
    expect(handleClose).toHaveBeenCalled()
    expect(mockPlayer.play).toHaveBeenCalled()
  })

  it('selects Auto quality when quality level -1 is selected', () => {
    jest
      .spyOn(React, 'useState')
      .mockImplementationOnce(() => [
        [
          {
            resolution: 'Auto',
            qualityLevel: -1,
            height: Number.MAX_SAFE_INTEGER
          },
          { resolution: '720p', qualityLevel: 0, height: 720 }
        ] as QualityMenuItem[],
        jest.fn()
      ])
      .mockImplementationOnce(() => [-1, jest.fn()])

    act(() => {
      render(
        <QualityMenu
          anchorEl={anchorEl}
          open
          onClose={handleClose}
          onBack={handleBack}
          player={mockPlayer as any}
          onQualityChanged={handleQualityChanged}
        />
      )
    })

    act(() => {
      fireEvent.click(screen.getByText('Auto'))
    })

    expect(mockPlayer.pause).toHaveBeenCalled()
    expect(handleClose).toHaveBeenCalled()
  })
})
