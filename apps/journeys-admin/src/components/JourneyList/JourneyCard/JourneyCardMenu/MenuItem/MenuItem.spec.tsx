import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { fireEvent } from '@storybook/testing-library'
import { render } from '@testing-library/react'
import { MenuItem } from '.'

describe('MenuItem', () => {
  it('should render', () => {
    const onClick = jest.fn()
    const { getByText, getByTestId } = render(
      <MenuItem
        icon={<AccountCircleIcon />}
        text="Account"
        handleClick={onClick}
      />
    )
    expect(getByTestId('AccountCircleIcon')).toBeInTheDocument()
    expect(getByText('Account')).toBeInTheDocument()

    fireEvent.click(getByText('Account'))
    expect(onClick).toHaveBeenCalled()
  })
})
