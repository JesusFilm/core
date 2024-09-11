import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { Header } from './Header'

describe('Header', () => {
  it('should have breadcrumbs and theme toggle', async () => {
    render(
      <NextIntlClientProvider locale="en">
        <Header />
      </NextIntlClientProvider>
    )

    expect(screen.getByTestId('NavBarBreadcrumbs')).toBeInTheDocument()
    expect(screen.getByTestId('ToggleColorModeDark')).toBeInTheDocument()
  })
})
