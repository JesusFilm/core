import { act, fireEvent, render, screen } from '@testing-library/react'

import { SettingsMenu } from '.'

describe('SettingsMenu', () => {
  const anchorEl = document.createElement('button')
  const handleClose = jest.fn()
  const handleQualityClick = jest.fn()
  const handleToggleStats = jest.fn()
  const currentQuality = 'Auto'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the settings menu when open', () => {
    act(() => {
      render(
        <SettingsMenu
          anchorEl={anchorEl}
          open
          onClose={handleClose}
          currentQuality={currentQuality}
          onQualityClick={handleQualityClick}
          onToggleStats={handleToggleStats}
        />
      )
    })

    expect(screen.getByText('Quality')).toBeInTheDocument()
    expect(screen.getByText(currentQuality)).toBeInTheDocument()
    expect(screen.getByText('Stats for nerds')).toBeInTheDocument()
  })

  it('does not render the menu when closed', () => {
    render(
      <SettingsMenu
        anchorEl={anchorEl}
        open={false}
        onClose={handleClose}
        currentQuality={currentQuality}
        onQualityClick={handleQualityClick}
        onToggleStats={handleToggleStats}
      />
    )

    expect(screen.queryByText('Quality')).not.toBeInTheDocument()
    expect(screen.queryByText(currentQuality)).not.toBeInTheDocument()
  })

  it('calls onQualityClick when quality menu item is clicked', () => {
    act(() => {
      render(
        <SettingsMenu
          anchorEl={anchorEl}
          open
          onClose={handleClose}
          currentQuality={currentQuality}
          onQualityClick={handleQualityClick}
          onToggleStats={handleToggleStats}
        />
      )
    })

    act(() => {
      fireEvent.click(screen.getByText('Quality'))
    })

    expect(handleQualityClick).toHaveBeenCalledTimes(1)
  })

  it('calls onToggleStats when Stats for nerds menu item is clicked', () => {
    act(() => {
      render(
        <SettingsMenu
          anchorEl={anchorEl}
          open
          onClose={handleClose}
          currentQuality={currentQuality}
          onQualityClick={handleQualityClick}
          onToggleStats={handleToggleStats}
        />
      )
    })

    act(() => {
      fireEvent.click(screen.getByText('Stats for nerds'))
    })

    expect(handleToggleStats).toHaveBeenCalledTimes(1)
  })

  it('displays the current quality setting', () => {
    const testQuality = 'High'
    act(() => {
      render(
        <SettingsMenu
          anchorEl={anchorEl}
          open
          onClose={handleClose}
          currentQuality={testQuality}
          onQualityClick={handleQualityClick}
          onToggleStats={handleToggleStats}
        />
      )
    })

    expect(screen.getByText(testQuality)).toBeInTheDocument()
  })

  it('has the correct menu ID', () => {
    act(() => {
      render(
        <SettingsMenu
          anchorEl={anchorEl}
          open
          onClose={handleClose}
          currentQuality={currentQuality}
          onQualityClick={handleQualityClick}
          onToggleStats={handleToggleStats}
        />
      )
    })

    const menu = document.getElementById('settings-menu')
    expect(menu).toBeInTheDocument()
  })
})
