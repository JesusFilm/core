import { render } from '@testing-library/react'
import { Button, ButtonProps } from '.'

const block: ButtonProps = {
  __typename: 'ButtonBlock',
  label: 'This is a button',
  variant: 'contained',
  color: 'primary',
  size: 'large',
  startIcon: {
    icon: 'checkCircle'
  }
}

describe('Button', () => {
  it('should render the button successfully', () => {
    const { getByText, getByTestId } = render(<Button {...block} />)
    expect(getByText('This is a button')).toBeTruthy()
    expect(getByTestId('ButtonComponent')).toBeTruthy()
  })

  it('should render the start icons', () => {
    const { getByTestId } = render(<Button {...block} />)
    expect(getByTestId('CheckCircleIcon')).toBeTruthy()
  })
})
