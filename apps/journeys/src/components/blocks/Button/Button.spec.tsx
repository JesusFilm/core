import { render } from '@testing-library/react'
import { ButtonFields } from '../../../../__generated__/ButtonFields'
import { Button } from '.'
import {
  ButtonVariant,
  ButtonColor,
  ButtonSize,
  IconColor,
  IconName,
  IconSize
} from '../../../../__generated__/globalTypes'

describe('Button', () => {
  const block: ButtonFields = {
    __typename: 'ButtonBlock',
    id: 'button',
    parentBlockId: 'question',
    label: 'This is a button',
    variant: ButtonVariant.contained,
    color: ButtonColor.primary,
    size: ButtonSize.small,
    startIcon: null,
    endIcon: null,
    action: null
  }

  it('should render the button successfully', () => {
    const { getByText, getByRole } = render(<Button {...block} />)
    expect(getByRole('button')).toHaveClass('MuiButton-root')
    expect(getByRole('button')).toHaveClass('MuiButton-contained')
    expect(getByRole('button')).toHaveClass('MuiButton-containedSizeSmall')
    expect(getByText('This is a button')).toBeInTheDocument()
  })

  it('should not render with the contained value', () => {
    const { getByRole } = render(<Button {...block} variant={null} />)
    expect(getByRole('button')).not.toHaveClass('MuiButton-contained')
  })

  it('should not render with the size value', () => {
    const { getByRole } = render(<Button {...block} size={null} />)
    expect(getByRole('button')).not.toHaveClass('MuiButton-containedSizeSmall')
  })

  it('should render the default color value', () => {
    const { getByRole } = render(<Button {...block} color={null} />)
    expect(getByRole('button')).toHaveClass('MuiButton-containedPrimary')
  })

  it('should render the start icon', () => {
    const { getByTestId } = render(
      <Button
        {...block}
        startIcon={{
          __typename: 'Icon',
          name: IconName.CheckCircle,
          color: IconColor.primary,
          size: IconSize.md
        }}
      />
    )
    expect(getByTestId('CheckCircleIcon')).toHaveClass('MuiSvgIcon-root')
    expect(getByTestId('CheckCircleIcon').parentElement).toHaveClass('MuiButton-startIcon')
  })
  it('should render the end icon', () => {
    const { getByTestId } = render(
      <Button
        {...block}
        endIcon={{
          __typename: 'Icon',
          name: IconName.CheckCircle,
          color: IconColor.primary,
          size: IconSize.md
        }}
      />
    )
    expect(getByTestId('CheckCircleIcon')).toHaveClass('MuiSvgIcon-root')
    expect(getByTestId('CheckCircleIcon').parentElement).toHaveClass('MuiButton-endIcon')
  })
})
