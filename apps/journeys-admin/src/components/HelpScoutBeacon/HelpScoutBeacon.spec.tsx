import { fireEvent, render, screen } from '@testing-library/react'
import { HelpScoutBeacon } from './HelpScoutBeacon'

jest.mock('next-firebase-auth', () => ({
  __esModule: true,
  useUser: jest.fn(() => ({
    id: 'userId',
    name: 'userName',
    email: 'user@example.com'
  }))
}))

describe('HelpScountBeacon', () => {
  it('should render icon button', () => {
    const handleClick = jest.fn()

    render(<HelpScoutBeacon handleClick={handleClick} />)

    fireEvent.click(screen.getByRole('button', { name: 'Help' }))
    expect(handleClick).toHaveBeenCalled()
  })

  it('should render menu item', () => {
    const handleClick = jest.fn()

    render(<HelpScoutBeacon variant="menuItem" handleClick={handleClick} />)

    fireEvent.click(screen.getByRole('menuitem', { name: 'Help' }))
    expect(handleClick).toHaveBeenCalled()
  })
})
