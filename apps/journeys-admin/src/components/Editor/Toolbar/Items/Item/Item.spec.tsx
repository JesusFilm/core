import { fireEvent, render, waitFor } from '@testing-library/react'

import Edit2Icon from '@core/shared/ui/icons/Edit2'

import { Item } from './Item'

describe('Item', () => {
  describe('icon button variant', () => {
    it('should handle icon button click', async () => {
      const handleClick = vi.fn()
      const { getByRole } = render(
        <Item
          variant="icon-button"
          label="Icon Button"
          href="https://test.com/"
          icon={<Edit2Icon />}
          onClick={handleClick}
        />
      )
      const IconButtonItem = getByRole('link', { name: 'Icon Button' })
      fireEvent.click(IconButtonItem)
      await waitFor(() => expect(handleClick).toHaveBeenCalled())
      expect(IconButtonItem.getAttribute('href')).toBe('https://test.com/')
      expect(IconButtonItem.getAttribute('target')).toBe('_blank')
    })
  })

  describe('button variant', () => {
    it('handles button click', async () => {
      const handleClick = vi.fn()
      const { getByRole } = render(
        <Item
          variant="button"
          label="Button"
          href="https://test.com/"
          icon={<Edit2Icon />}
          onClick={handleClick}
        />
      )
      const ButtonItem = getByRole('link', { name: 'Button' })
      fireEvent.click(ButtonItem)
      await waitFor(() => expect(handleClick).toHaveBeenCalled())
      expect(ButtonItem.getAttribute('href')).toBe('https://test.com/')
      expect(ButtonItem.getAttribute('target')).toBe('_blank')
    })

    // Labels that can break mid-string (CJK breaks between any two characters,
    // unlike a single Latin word) wrapped to two lines once the toolbar ran out
    // of room, doubling the button height. NES-1861.
    it('keeps the label on one line', () => {
      const { getByRole } = render(
        <Item variant="button" label="战略" icon={<Edit2Icon />} />
      )

      expect(getByRole('button', { name: '战略' })).toHaveStyle({
        whiteSpace: 'nowrap'
      })
    })

    it('keeps the label on one line when the caller passes its own sx', () => {
      const { getByRole } = render(
        <Item
          variant="button"
          label="分享"
          icon={<Edit2Icon />}
          ButtonProps={{ sx: { backgroundColor: 'background.paper' } }}
        />
      )

      expect(getByRole('button', { name: '分享' })).toHaveStyle({
        whiteSpace: 'nowrap'
      })
    })
  })

  describe('menu item variant', () => {
    it('handles menu item click', async () => {
      const handleClick = vi.fn()
      const { getByRole } = render(
        <Item
          variant="menu-item"
          label="Menu"
          href="https://test.com/"
          icon={<Edit2Icon />}
          onClick={handleClick}
        />
      )
      const MenuItem = getByRole('menuitem', { name: 'Menu' })
      fireEvent.click(MenuItem)
      await waitFor(() => expect(handleClick).toHaveBeenCalled())
      expect(MenuItem.getAttribute('href')).toBe('https://test.com/')
      expect(MenuItem.getAttribute('target')).toBe('_blank')
    })
  })
})
