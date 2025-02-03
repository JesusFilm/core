import { fireEvent, render, screen } from '@testing-library/react'

import { RedirectDialog } from './RedirectDialog'

describe('RedirectDialog', () => {
  const handleClose = jest.fn()
  window.open = jest.fn()

  it('should render the RedirectDialog', () => {
    render(<RedirectDialog open onClose={handleClose} to="url" />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'The QR code was redirected to:'
    )
  })

  it('should call onClose when close button is clicked', () => {
    render(<RedirectDialog open onClose={handleClose} />)

    fireEvent.click(screen.getByTestId('CloseRoundedIcon'))
    expect(handleClose).toHaveBeenCalled()
  })

  it('should handle redirect click', () => {
    render(<RedirectDialog open onClose={handleClose} to="url" />)

    fireEvent.click(screen.getByRole('button', { name: 'Go to this journey' }))
    expect(window.open).toHaveBeenCalledWith('url', '_blank')
  })
})
