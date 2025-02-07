import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { ChangeButton } from './ChangeButton'

describe('ChangeButton', () => {
  it('should render the ChangeButton component', () => {
    const handleClick = jest.fn()
    render(<ChangeButton handleClick={handleClick} />)

    fireEvent.click(screen.getByRole('button', { name: 'Change' }))
    expect(handleClick).toHaveBeenCalled()
  })

  it('should show redirect button', () => {
    const handleRedirect = jest.fn()
    render(<ChangeButton showRedirectButton handleRedirect={handleRedirect} />)

    expect(
      screen.queryByRole('button', { name: 'Change' })
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Redirect' }))
    expect(handleRedirect).toHaveBeenCalled()
  })

  it('should show tooltip on hover when disabled', async () => {
    render(<ChangeButton disabled />)

    fireEvent.mouseOver(screen.getByRole('button'))
    await waitFor(() =>
      expect(
        screen.getByText(
          'Only the journey owner can change the QR code destination.'
        )
      ).toBeInTheDocument()
    )
  })
})
