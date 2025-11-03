import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { AppNavbar } from './AppNavbar'

jest.mock('next/navigation')

describe('AppNavBar', () => {
  it('should show theme toggle and menu button and logo', () => {
    render(<AppNavbar />)
    expect(screen.getByRole('img')).toBeInTheDocument()

    expect(screen.getByTestId('ToggleColorModeDark')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'menu' })).toBeInTheDocument()
  })

  it('should show menu drawer on menu button click', async () => {
    render(<AppNavbar />)

    await waitFor(() =>
      fireEvent.click(screen.getByRole('button', { name: 'menu' }))
    )
    await waitFor(() =>
      expect(screen.getByTestId('SideMenuMobile')).toBeInTheDocument()
    )
  })
})
