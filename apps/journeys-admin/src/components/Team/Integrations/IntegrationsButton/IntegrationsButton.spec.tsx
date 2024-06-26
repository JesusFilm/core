import { render, screen } from '@testing-library/react'

import { IntegrationsButton } from '.'

describe('IntegrationsButton', () => {
  it('should render integrations button', () => {
    render(<IntegrationsButton url="https://example.com" title="Title" />)
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByTestId('Title-IntegrationsButton')).toHaveAttribute(
      'href',
      'https://example.com'
    )
  })

  it('should render integrations button as an add button', () => {
    render(
      <IntegrationsButton
        url="https://example.com"
        title="Title"
        showAddButton
      />
    )
    expect(screen.getByTestId('Plus1Icon')).toBeInTheDocument()
  })

  it('should render integrations button with image', () => {
    render(
      <IntegrationsButton
        url="https://example.com"
        title="Title"
        src="https://example.com/image.jpg"
      />
    )
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      'https://example.com/image.jpg'
    )
  })
})
