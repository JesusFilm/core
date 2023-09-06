import AbcRoundedIcon from '@mui/icons-material/AbcRounded'
import { fireEvent, render } from '@testing-library/react'

import { NavigationListItem } from './NavigationListItem'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

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
    const { getByRole } = render(
      <NavigationListItem
        icon={<AbcRoundedIcon />}
        label="menu item"
        selected
        link="/"
      />
    )
    expect(getByRole('link', { name: 'menu item' })).toHaveAttribute(
      'href',
      '/'
    )
  })

  it('should render menu item with tool tip and badge', () => {
    const { getByTestId, getByLabelText } = render(
      <NavigationListItem
        icon={<AbcRoundedIcon />}
        label="menu item"
        selected
        tooltipText="item label"
      />
    )
    expect(getByTestId('nav-notification-badge')).toBeInTheDocument()
    expect(getByLabelText('item label')).toBeInTheDocument()
  })

  it('should render menu item with link, tool tip and badge', () => {
    const { getByRole, getByTestId, getByLabelText } = render(
      <NavigationListItem
        icon={<AbcRoundedIcon />}
        label="menu item"
        selected
        link="/"
        tooltipText="item label"
      />
    )
    expect(getByRole('link')).toHaveAttribute('href', '/')
    expect(getByTestId('nav-notification-badge')).toBeInTheDocument()
    expect(getByLabelText('item label')).toBeInTheDocument()
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
