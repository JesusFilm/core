import { render, screen, within } from '@testing-library/react'
import { ItemRowMenu } from './ItemRowMenu'
import userEvent from '@testing-library/user-event'

describe('ItemRowMenu', () => {
  it('should render', () => {
    const mockView = jest.fn()

    render(<ItemRowMenu actions={[{ label: 'View', handler: mockView }]} />)

    const button = screen.getByRole('button', { name: 'row-item-menu-button' })
    expect(button).toBeInTheDocument()
  })

  it('should emit callback for menu button', async () => {
    const mockView = jest.fn()

    render(<ItemRowMenu actions={[{ label: 'View', handler: mockView }]} />)

    const button = screen.getByRole('button', { name: 'row-item-menu-button' })
    expect(button).toBeInTheDocument()

    await userEvent.click(button)

    const menu = screen.getByRole('menu', { name: 'row-item-menu' })
    expect(menu).toBeInTheDocument()

    const menuAction = within(menu).getByRole('menuitem', { name: 'View' })
    expect(menuAction).toBeInTheDocument()

    await userEvent.click(menuAction)

    expect(mockView).toHaveBeenCalled()
  })
})
