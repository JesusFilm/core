import { fireEvent, render } from '@testing-library/react'
import AbcRoundedIcon from '@mui/icons-material/AbcRounded'
import { NavigationMenuItem } from './NavigationMenuItem'

describe('NavigationMenuItem', () => {
  it('renders menu item', () => {
    const { getByText, getByTestId } = render(
      <NavigationMenuItem
        icon={<AbcRoundedIcon />}
        text="menu item"
        color="#fff"
      />
    )
    expect(getByTestId('AbcRoundedIcon')).toBeInTheDocument()
    expect(getByTestId('AbcRoundedIcon')).toHaveStyle(`color: "#fff"`)
    expect(getByText('menu item')).toBeInTheDocument()
  })

  it('renders menuitem with link', () => {
    const { getByTestId } = render(
      <NavigationMenuItem
        icon={<AbcRoundedIcon />}
        text="menu item"
        color="#fff"
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
      <NavigationMenuItem
        icon={<AbcRoundedIcon />}
        text="menu item"
        color="#fff"
        handleClick={onClick}
      />
    )
    fireEvent.click(getByRole('button', { name: 'menu item' }))
    expect(onClick).toHaveBeenCalled()
  })
})
