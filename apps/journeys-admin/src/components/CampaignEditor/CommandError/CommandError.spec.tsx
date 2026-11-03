import { render, screen } from '@testing-library/react'

import { CommandError } from './CommandError'

describe('CommandError', () => {
  it('shows the refusal’s message verbatim as an alert', () => {
    render(<CommandError error="primaryColor must be a hex colour" />)

    expect(screen.getByRole('alert')).toHaveTextContent(
      'primaryColor must be a hex colour'
    )
  })

  it('renders nothing without an error', () => {
    const { container } = render(<CommandError />)

    expect(container).toBeEmptyDOMElement()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('renders nothing for a null error', () => {
    const { container } = render(<CommandError error={null} />)

    expect(container).toBeEmptyDOMElement()
  })
})
