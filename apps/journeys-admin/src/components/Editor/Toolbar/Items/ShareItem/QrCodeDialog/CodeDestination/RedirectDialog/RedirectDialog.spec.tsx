import { fireEvent, render, screen } from '@testing-library/react'

import { QrCodeFields as QrCode } from '../../../../../../../../../__generated__/QrCodeFields'

import { RedirectDialog } from './RedirectDialog'

describe('RedirectDialog', () => {
  window.open = jest.fn()
  const qrCode: QrCode = {
    __typename: 'QrCode',
    id: 'qrCode.id',
    toJourneyId: 'journey.id',
    shortLink: {
      __typename: 'ShortLink',
      id: 'shortLink.id',
      domain: {
        __typename: 'ShortLinkDomain',
        hostname: 'localhost'
      },
      pathname: 'shortId',
      to: 'destinationUrl'
    }
  }

  it('should render the RedirectDialog', () => {
    render(
      <RedirectDialog
        open
        onClose={jest.fn()}
        to="url"
        qrCode={qrCode}
        handleUndo={jest.fn()}
      />
    )
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'The QR code was redirected to:'
    )
  })

  it('should call onClose when close button is clicked', () => {
    const handleClose = jest.fn()

    render(
      <RedirectDialog
        open
        onClose={handleClose}
        to="url"
        qrCode={qrCode}
        handleUndo={jest.fn()}
      />
    )

    fireEvent.click(screen.getByTestId('CloseRoundedIcon'))
    expect(handleClose).toHaveBeenCalled()
  })

  it('should handle redirect click', () => {
    Object.defineProperty(window, 'origin', {
      value: 'http://localhost:4200',
      writable: true
    })

    render(
      <RedirectDialog
        open
        onClose={jest.fn()}
        to="url"
        qrCode={qrCode}
        handleUndo={jest.fn()}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Go to this journey' }))
    expect(window.open).toHaveBeenCalledWith(
      `http://localhost:4200/journeys/${qrCode.toJourneyId}`,
      '_blank'
    )
  })

  it('should handle undo', () => {
    const handleUndo = jest.fn()

    render(
      <RedirectDialog
        open
        onClose={jest.fn()}
        to="url"
        qrCode={qrCode}
        handleUndo={handleUndo}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Undo changes' }))
    expect(handleUndo).toHaveBeenCalled()
  })

  it('should not focus ont he text field', () => {
    render(
      <RedirectDialog
        open
        onClose={jest.fn()}
        to="url"
        qrCode={qrCode}
        handleUndo={jest.fn()}
      />
    )

    fireEvent.click(screen.getByRole('textbox'))
    expect(screen.getByRole('textbox')).not.toHaveClass('Mui-focused')
  })
})
