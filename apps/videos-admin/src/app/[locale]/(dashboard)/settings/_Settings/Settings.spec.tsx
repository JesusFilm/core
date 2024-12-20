import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { Settings } from './Settings'

describe('Settings', () => {
  it('should render settings', () => {
    render(
      <NextIntlClientProvider locale="en">
        <Settings />
      </NextIntlClientProvider>
    )

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Settings'
    )
  })
})
