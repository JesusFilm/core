import { fireEvent, render, waitFor } from '@testing-library/react'

import Edit2Icon from '@core/shared/ui/icons/Edit2'

import { Item } from './Item'

describe('Item', () => {
  it('renders icon button item', async () => {
    const handleClick = jest.fn()
    const { getByTestId } = render(
      <Item
        variant="icon-button"
        label="Icon Button"
        icon={<Edit2Icon />}
        onClick={handleClick}
      />
    )
    const IconButtonItem = getByTestId('Icon Button-Item')
    fireEvent.click(IconButtonItem)
    await waitFor(() => expect(handleClick).toHaveBeenCalled())
  })

  it('renders button item', async () => {
    const handleClick = jest.fn()
    const { getByTestId } = render(
      <Item
        variant="button"
        label="Button"
        icon={<Edit2Icon />}
        onClick={handleClick}
      />
    )
    const ButtonItem = getByTestId('Button-Item')
    fireEvent.click(ButtonItem)
    await waitFor(() => expect(handleClick).toHaveBeenCalled())
  })

  it('renders menu item', async () => {
    const handleClick = jest.fn()
    const { getByTestId } = render(
      <Item
        variant="menu-item"
        label="Menu"
        icon={<Edit2Icon />}
        onClick={handleClick}
      />
    )
    const MenuItem = getByTestId('Menu-Item')
    fireEvent.click(MenuItem)
    await waitFor(() => expect(handleClick).toHaveBeenCalled())
  })
})
