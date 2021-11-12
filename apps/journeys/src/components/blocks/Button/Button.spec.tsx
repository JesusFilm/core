import { render, fireEvent } from '@testing-library/react'
import { Button, ButtonData as block } from '.'
import {
  ButtonVariant,
  ButtonSize,
  IconColor,
  IconName,
  IconSize
} from '../../../../__generated__/globalTypes'
import { handleAction } from '../../../libs/action'

jest.mock('../../../libs/action', () => {
  const originalModule = jest.requireActual('../../../libs/action')
  return {
    __esModule: true,
    ...originalModule,
    handleAction: jest.fn()
  }
})

jest.mock('next/router', () => ({
  useRouter() {
    return {
      push: () => null
    }
  }
}))

describe('Button', () => {
  it('should render the button successfully', () => {
    const { getByText, getByRole } = render(<Button {...block} />)
    expect(getByRole('button')).toHaveClass('MuiButton-root')
    expect(getByRole('button')).toHaveClass('MuiButton-contained')
    expect(getByRole('button')).toHaveClass('MuiButton-containedSizeSmall')
    expect(getByText('This is a button')).toBeInTheDocument()
  })

  it('should render with the contained value', () => {
    const { getByRole } = render(
      <Button {...block} buttonVariant={ButtonVariant.contained} />
    )
    expect(getByRole('button')).toHaveClass('MuiButton-contained')
  })

  it('should render with the size value', () => {
    const { getByRole } = render(<Button {...block} size={ButtonSize.small} />)
    expect(getByRole('button')).toHaveClass('MuiButton-containedSizeSmall')
  })

  it('should render the default color value', () => {
    const { getByRole } = render(<Button {...block} buttonColor={null} />)
    expect(getByRole('button')).toHaveClass('MuiButton-containedPrimary')
  })

  it('should render the start icon', () => {
    const { getByTestId } = render(
      <Button
        {...block}
        startIcon={{
          __typename: 'Icon',
          name: IconName.CheckCircleRounded,
          color: IconColor.primary,
          size: IconSize.md
        }}
      />
    )
    expect(getByTestId('CheckCircleRoundedIcon')).toHaveClass('MuiSvgIcon-root')
    expect(getByTestId('CheckCircleRoundedIcon').parentElement).toHaveClass(
      'MuiButton-startIcon'
    )
  })
  it('should render the end icon', () => {
    const { getByTestId } = render(
      <Button
        {...block}
        endIcon={{
          __typename: 'Icon',
          name: IconName.CheckCircleRounded,
          color: IconColor.primary,
          size: IconSize.md
        }}
      />
    )
    expect(getByTestId('CheckCircleRoundedIcon')).toHaveClass('MuiSvgIcon-root')
    expect(getByTestId('CheckCircleRoundedIcon').parentElement).toHaveClass(
      'MuiButton-endIcon'
    )
  })

  it('should call actionHandler on click', () => {
    const { getByRole } = render(
      <Button
        {...block}
        action={{
          __typename: 'NavigateToBlockAction',
          gtmEventName: 'gtmEventName',
          blockId: 'def'
        }}
      />
    )
    fireEvent.click(getByRole('button'))
    expect(handleAction).toBeCalledWith(
      expect.objectContaining({
        push: expect.any(Function)
      }),
      {
        __typename: 'NavigateToBlockAction',
        gtmEventName: 'gtmEventName',
        blockId: 'def'
      }
    )
  })
})
