import { render, screen } from '@testing-library/react'

import { LinkNodeAnalytics } from '.'

describe('LinkNodeAnalytics', () => {
  it('should render with count', () => {
    render(<LinkNodeAnalytics clicksCount={10} />)

    const icon = screen.getByTestId('Cursor4Icon')
    const clickCount = screen.getByText('10')

    expect(icon).toBeInTheDocument()
    expect(clickCount).toBeInTheDocument()
  })

  it('should render default value', () => {
    render(<LinkNodeAnalytics />)

    // should show the tilde
    const clickCount = screen.getByText('~')
    expect(clickCount).toBeInTheDocument()
  })
})
