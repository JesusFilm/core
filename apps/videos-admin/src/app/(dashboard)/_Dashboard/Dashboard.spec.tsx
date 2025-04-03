import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { Dashboard } from './Dashboard'

describe('Dashboard', () => {
  it('should render Dashboard', () => {
    render(
      <NextIntlClientProvider locale="en">
        <Dashboard />
      </NextIntlClientProvider>
    )

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Dashboard'
    )
  })
})
