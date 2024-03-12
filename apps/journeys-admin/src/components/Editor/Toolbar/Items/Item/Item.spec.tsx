import { fireEvent, render, waitFor } from '@testing-library/react'

import Edit2Icon from '@core/shared/ui/icons/Edit2'

import { Item } from './Item'

describe('Item', () => {
  it('handles icon button item click', async () => {
    const handleClick = jest.fn()
    const { getByTestId } = render(
      <Item
        variant="icon-button"
        label="Icon Button"
        href="https://test.com/"
        icon={<Edit2Icon />}
        onClick={handleClick}
      />
    )
    const IconButtonItem = getByTestId('Icon ButtonIconButtonItem')
    fireEvent.click(IconButtonItem)
    await waitFor(() => expect(handleClick).toHaveBeenCalled())
    expect(IconButtonItem.getAttribute('href')).toBe('https://test.com/')
    expect(IconButtonItem.getAttribute('target')).toBe('_blank')
  })

  it('handles button item click', async () => {
    const handleClick = jest.fn()
    const { getByTestId } = render(
      <Item
        variant="button"
        label="Button"
        href="https://test.com/"
        icon={<Edit2Icon />}
        onClick={handleClick}
      />
    )
    const ButtonItem = getByTestId('ButtonButtonItem')
    fireEvent.click(ButtonItem)
    await waitFor(() => expect(handleClick).toHaveBeenCalled())
    expect(ButtonItem.getAttribute('href')).toBe('https://test.com/')
    expect(ButtonItem.getAttribute('target')).toBe('_blank')
  })

  it('handles menu item click', async () => {
    const handleClick = jest.fn()
    const { getByTestId } = render(
      <Item
        variant="menu-item"
        label="Menu"
        href="https://test.com/"
        icon={<Edit2Icon />}
        onClick={handleClick}
      />
    )
    const MenuItem = getByTestId('MenuMenuItemItem')
    fireEvent.click(MenuItem)
    await waitFor(() => expect(handleClick).toHaveBeenCalled())
    expect(MenuItem.getAttribute('href')).toBe('https://test.com/')
    expect(MenuItem.getAttribute('target')).toBe('_blank')
  })
})
