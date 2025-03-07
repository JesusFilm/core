import { fireEvent, render, screen } from '@testing-library/react'

import { SettingsMenu } from '.'

describe('SettingsMenu', () => {
  const anchorEl = document.createElement('button')
  const handleClose = jest.fn()
  const handleQualityClick = jest.fn()
  const currentQuality = 'Auto'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the settings menu when open', () => {
    render(
      <SettingsMenu
        anchorEl={anchorEl}
        open
        onClose={handleClose}
        currentQuality={currentQuality}
        onQualityClick={handleQualityClick}
      />
    )

    expect(screen.getByText('Quality')).toBeInTheDocument()
    expect(screen.getByText(currentQuality)).toBeInTheDocument()
  })

  it('does not render the menu when closed', () => {
    render(
      <SettingsMenu
        anchorEl={anchorEl}
        open={false}
        onClose={handleClose}
        currentQuality={currentQuality}
        onQualityClick={handleQualityClick}
      />
    )

    expect(screen.queryByText('Quality')).not.toBeInTheDocument()
    expect(screen.queryByText(currentQuality)).not.toBeInTheDocument()
  })

  it('calls onQualityClick when quality menu item is clicked', () => {
    render(
      <SettingsMenu
        anchorEl={anchorEl}
        open
        onClose={handleClose}
        currentQuality={currentQuality}
        onQualityClick={handleQualityClick}
      />
    )

    fireEvent.click(screen.getByText('Quality'))
    expect(handleQualityClick).toHaveBeenCalledTimes(1)
  })

  it('displays the current quality setting', () => {
    const testQuality = 'High'
    render(
      <SettingsMenu
        anchorEl={anchorEl}
        open
        onClose={handleClose}
        currentQuality={testQuality}
        onQualityClick={handleQualityClick}
      />
    )

    expect(screen.getByText(testQuality)).toBeInTheDocument()
  })

  it('has the correct menu ID', () => {
    render(
      <SettingsMenu
        anchorEl={anchorEl}
        open
        onClose={handleClose}
        currentQuality={currentQuality}
        onQualityClick={handleQualityClick}
      />
    )

    const menu = document.getElementById('settings-menu')
    expect(menu).toBeInTheDocument()
  })
})
