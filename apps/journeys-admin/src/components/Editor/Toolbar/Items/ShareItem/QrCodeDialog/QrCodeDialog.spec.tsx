import { fireEvent, render, screen } from '@testing-library/react'

import { QrCodeDialog } from './QrCodeDialog'

describe('QrCodeDialog', () => {
  const handleClose = jest.fn()

  it('should render the dialog', () => {
    render(<QrCodeDialog open onClose={handleClose} />)

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'QR Code'
    )
  })

  it('should call onClose when close button is clicked', () => {
    render(<QrCodeDialog open onClose={handleClose} />)

    fireEvent.click(screen.getByTestId('CloseRoundedIcon'))
    expect(handleClose).toHaveBeenCalled()
  })

  it('should show QR code if to exists', () => {
    render(<QrCodeDialog open onClose={handleClose} initialJourneyUrl="url" />)

    expect(screen.getByRole('img', { name: 'QR Code' })).toBeInTheDocument()
  })

  it('should show generate button if no to value', () => {
    render(<QrCodeDialog open onClose={handleClose} />)

    expect(
      screen.queryByRole('img', { name: 'QR Code' })
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Generate' })).toBeInTheDocument()
  })

  it('should generate QR code when generate button is clicked', () => {
    render(<QrCodeDialog open onClose={handleClose} />)

    expect(
      screen.queryByRole('img', { name: 'QR Code' })
    ).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }))
    expect(screen.getByRole('img', { name: 'QR Code' })).toBeInTheDocument()
  })
})
