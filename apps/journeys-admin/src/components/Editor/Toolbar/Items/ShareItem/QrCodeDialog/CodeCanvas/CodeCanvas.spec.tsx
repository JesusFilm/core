import { screen } from '@testing-library/dom'
import { render } from '@testing-library/react'

import { CodeCanvas } from './CodeCanvas'

describe('CodeCanvas', () => {
  beforeAll(() => {
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value: jest.fn()
    })
  })

  it('should show qr code', () => {
    render(<CodeCanvas shortLink="url" loading={false} />)
    expect(screen.getByRole('img', { name: 'url' })).toBeInTheDocument()
  })

  it('should loading skeleton', () => {
    render(<CodeCanvas shortLink="url" loading />)
    expect(screen.getByLabelText('Loading QR code')).toBeInTheDocument()
  })

  it('should empty qr code', () => {
    render(<CodeCanvas shortLink={undefined} loading={false} />)
    expect(screen.getByTestId('GridEmptyIcon')).toBeInTheDocument()
  })
})
