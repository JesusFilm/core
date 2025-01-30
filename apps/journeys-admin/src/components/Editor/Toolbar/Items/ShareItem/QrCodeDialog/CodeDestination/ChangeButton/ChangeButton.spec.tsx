import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { ChangeButton } from './ChangeButton'

describe('ChangeButton', () => {
  it('should render the ChangeButton component', () => {
    render(<ChangeButton />)

    expect(screen.getByRole('button', { name: 'Change' })).toBeInTheDocument()
  })

  it('should show redirect button', () => {
    render(<ChangeButton showRedirectButton />)

    expect(
      screen.queryByRole('button', { name: 'Change' })
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Redirect' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
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
