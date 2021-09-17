import { render } from '@testing-library/react'
import { Button, ButtonProps } from '.'
import { ButtonBlockVariant, ButtonColor, ButtonSize, IconColor, IconName } from '../../../__generated__/globalTypes'

const block: ButtonProps = {
  __typename: 'ButtonBlock',
  id: 'button',
  parentBlockId: 'question',
  label: 'This is a button',
  variant: ButtonBlockVariant.contained,
  color: ButtonColor.primary,
  size: ButtonSize.small,
  startIcon: null,
  endIcon: null,
  action: null
}

describe('Button', () => {
  it('should render the button successfully', () => {
    const { getByText, getByTestId } = render(<Button {...block} />)
    expect(getByText('This is a button')).toBeTruthy()
    expect(getByTestId('ButtonComponent')).toBeTruthy()
  })

  it('should render the correct icon', () => {
    const { getByTestId } = render(<Button {...block} startIcon={{
      __typename: 'Icon',
      name: IconName.CheckCircle,
      color: IconColor.primary,
      fontSize: '48px'
    }} />)
    expect(getByTestId('CheckCircleIcon')).toBeTruthy()
  })
})
