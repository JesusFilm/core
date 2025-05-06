import { fireEvent, render, screen } from '@testing-library/react'

import { SettingsButton } from '.'

describe('SettingsButton', () => {
  it('renders the settings button', () => {
    const handleClick = jest.fn()
    render(<SettingsButton onClick={handleClick} open={false} />)
    expect(screen.getByLabelText('video settings')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<SettingsButton onClick={handleClick} open={false} />)

    fireEvent.click(screen.getByLabelText('video settings'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('sets correct aria attributes when open is false', () => {
    const handleClick = jest.fn()
    render(<SettingsButton onClick={handleClick} open={false} />)

    const button = screen.getByLabelText('video settings')
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button).toHaveAttribute('aria-haspopup', 'false')
    expect(button).toHaveAttribute('aria-controls', 'settings-menu')
  })

  it('sets correct aria attributes when open is true', () => {
    const handleClick = jest.fn()
    render(<SettingsButton onClick={handleClick} open />)

    const button = screen.getByLabelText('video settings')
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(button).toHaveAttribute('aria-haspopup', 'true')
    expect(button).toHaveAttribute('aria-controls', 'settings-menu')
  })

  it('contains the settings icon', () => {
    const handleClick = jest.fn()
    render(<SettingsButton onClick={handleClick} open={false} />)

    const button = screen.getByLabelText('video settings')
    expect(button.querySelector('svg')).toBeInTheDocument()
  })
})
