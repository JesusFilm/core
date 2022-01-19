import { render, fireEvent } from '@testing-library/react'
import {
  ButtonVariant,
  ButtonColor,
  ButtonSize,
  IconColor,
  IconName,
  IconSize
} from '../../../__generated__/globalTypes'
import { handleAction, TreeBlock, EditorProvider } from '../..'
import { ButtonFields } from './__generated__/ButtonFields'
import { Button } from '.'

jest.mock('../../libs/action', () => {
  const originalModule = jest.requireActual('../../libs/action')
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

const block: TreeBlock<ButtonFields> = {
  __typename: 'ButtonBlock',
  id: 'button',
  journeyId: 'journey1.id',
  parentBlockId: 'question',
  label: 'This is a button',
  buttonVariant: ButtonVariant.contained,
  buttonColor: ButtonColor.primary,
  size: ButtonSize.small,
  startIcon: null,
  endIcon: null,
  action: null,
  children: []
}

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

describe('Admin Button', () => {
  it('should edit label on click', () => {
    const { getByRole } = render(
      <EditorProvider
        initialState={{
          selectedBlock: {
            id: 'card0.id',
            __typename: 'CardBlock',
            journeyId: 'journey1.id',
            parentBlockId: 'step0.id',
            coverBlockId: null,
            backgroundColor: null,
            themeMode: null,
            themeName: null,
            fullscreen: false,
            children: [block]
          }
        }}
      >
        <Button {...block} />
      </EditorProvider>
    )

    fireEvent.click(getByRole('button'))

    expect(getByRole('button')).toHaveStyle('outline: 3px solid #C52D3A')
    // Test editable when implemented
  })
})
