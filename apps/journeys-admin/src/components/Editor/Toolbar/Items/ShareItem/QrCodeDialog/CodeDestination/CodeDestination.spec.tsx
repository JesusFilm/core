import { render, screen } from '@testing-library/react'

import { CodeDestination } from './CodeDestination'

describe('CodeDestination', () => {
  it('should display the code destination', async () => {
    const to = 'http://localhost:4100/destinationUrl'
    render(<CodeDestination to={to} />)

    expect(screen.getByRole('textbox')).toHaveValue(to)
  })
})
