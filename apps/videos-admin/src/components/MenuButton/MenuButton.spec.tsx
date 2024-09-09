import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { MenuButton } from './MenuButton'

describe('MenuButton', () => {
  it('should show badge if present', () => {
    render(
      <NextIntlClientProvider locale="en">
        <MenuButton showBadge />
      </NextIntlClientProvider>
    )
    expect(screen.getByTestId('MenuButtonBadge')).toBeInTheDocument()
  })
})
