import { fireEvent, render, screen } from '@testing-library/react'

import { HelpScoutBeacon } from './HelpScoutBeacon'

describe('HelpScoutBeacon', () => {
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
