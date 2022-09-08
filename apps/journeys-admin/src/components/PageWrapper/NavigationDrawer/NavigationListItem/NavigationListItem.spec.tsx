import { fireEvent, render } from '@testing-library/react'
import AbcRoundedIcon from '@mui/icons-material/AbcRounded'
import { NavigationListItem } from './NavigationListItem'

describe('NavigationListItem', () => {
  it('renders menu item', () => {
    const { getByRole } = render(
      <NavigationListItem
        icon={<AbcRoundedIcon />}
        label="menu item"
        selected={false}
      />
    )
    expect(getByRole('button', { name: 'menu item' })).toHaveAttribute(
      'aria-selected',
      'false'
    )
  })

  it('renders menuitem with link', () => {
    const { getByTestId } = render(
      <NavigationListItem
        icon={<AbcRoundedIcon />}
        label="menu item"
        selected
        link="/"
      />
    )
    expect(
      getByTestId('AbcRoundedIcon').parentElement?.parentElement
    ).toHaveAttribute('href', '/')
  })

  it('calls onClick', () => {
    const onClick = jest.fn()
    const { getByRole } = render(
      <NavigationListItem
        icon={<AbcRoundedIcon />}
        label="menu item"
        selected
        handleClick={onClick}
      />
    )
    fireEvent.click(getByRole('button', { name: 'menu item' }))
    expect(onClick).toHaveBeenCalled()
  })

  it('should be selected', () => {
    const { getByRole } = render(
      <NavigationListItem
        icon={<AbcRoundedIcon />}
        label="menu item"
        selected
      />
    )
    expect(getByRole('button')).toHaveAttribute('aria-selected', 'true')
  })
})
