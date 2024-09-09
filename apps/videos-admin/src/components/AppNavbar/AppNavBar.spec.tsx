import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { AppNavbar } from './AppNavbar'

jest.mock('next/navigation')

describe('AppNavBar', () => {
  it('should show theme toggle and menu button and logo', () => {
    render(
      <NextIntlClientProvider locale="en">
        <AppNavbar />
      </NextIntlClientProvider>
    )
    expect(screen.getByRole('img')).toBeInTheDocument()

    expect(screen.getByTestId('ToggleColorModeDark')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'menu' })).toBeInTheDocument()
  })

  it('should show menu drawer on menu button click', async () => {
    render(
      <NextIntlClientProvider locale="en">
        <AppNavbar />
      </NextIntlClientProvider>
    )

    await waitFor(() =>
      fireEvent.click(screen.getByRole('button', { name: 'menu' }))
    )
    await waitFor(() =>
      expect(screen.getByTestId('SideMenuMobile')).toBeInTheDocument()
    )
  })
})
