import { render, screen } from '@testing-library/react'

import { Header } from './Header'

describe('Header', () => {
  it('should have breadcrumbs and theme toggle', async () => {
    render(<Header />)

    expect(screen.getByTestId('NavBarBreadcrumbs')).toBeInTheDocument()
    expect(screen.getByTestId('ToggleColorModeDark')).toBeInTheDocument()
  })
})
