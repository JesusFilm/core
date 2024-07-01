import { render, screen } from '@testing-library/react'

import { IntegrationsButton } from '.'
import { IntegrationType } from '../../../../../__generated__/globalTypes'

describe('IntegrationsButton', () => {
  it('should render integrations button', () => {
    render(
      <IntegrationsButton
        url="https://example.com"
        type={IntegrationType.growthSpaces}
      />
    )
    expect(screen.getByText('Growth Spaces')).toBeInTheDocument()
    expect(screen.getByRole('img').getAttribute('src')).toBe(
      'growth-spaces-logo.png'
    )
    expect(
      screen.getByTestId('growthSpaces-IntegrationsButton')
    ).toHaveAttribute('href', 'https://example.com')
  })

  it('should render integrations button as an add button', () => {
    render(<IntegrationsButton url="https://example.com" showAddButton />)
    expect(screen.getByTestId('Plus1Icon')).toBeInTheDocument()
  })
})
