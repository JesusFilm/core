import { render, screen } from '@testing-library/react'

import { MenuButton } from './MenuButton'

describe('MenuButton', () => {
  it('should show badge if present', () => {
    render(<MenuButton showBadge />)
    expect(screen.getByTestId('MenuButtonBadge')).toBeInTheDocument()
  })
})
