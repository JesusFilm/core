import { MockedProvider } from '@apollo/client/testing'
import { sendGTMEvent } from '@next/third-parties/google'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useFormikContext } from 'formik'
import { usePlausible } from 'next-plausible'
import { v4 as uuidv4 } from 'uuid'

import {
  ButtonAlignment,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  IconColor,
  IconName,
  IconSize,
  MessagePlatform
} from '../../../__generated__/globalTypes'
import { handleAction } from '../../libs/action'
import { TreeBlock, blockHistoryVar, treeBlocksVar } from '../../libs/block'
import { BlockFields_StepBlock as StepBlock } from '../../libs/block/__generated__/BlockFields'
import { JourneyProvider } from '../../libs/JourneyProvider'
import { JourneyFields as Journey } from '../../libs/JourneyProvider/__generated__/JourneyFields'
import { keyify } from '../../libs/plausibleHelpers'

import {
  ButtonFields,
  ButtonFields_action,
  ButtonFields_action_LinkAction as LinkAction
} from './__generated__/ButtonFields'
import { BUTTON_CLICK_EVENT_CREATE, CHAT_OPEN_EVENT_CREATE } from './Button'
import { GoalType } from './utils/getLinkActionGoal'

import { Button } from '.'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

jest.mock('@next/third-parties/google', () => ({
  sendGTMEvent: jest.fn()
}))

const mockedSendGTMEvent = sendGTMEvent as jest.MockedFunction<
  typeof sendGTMEvent
>

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

jest.mock('next-plausible', () => ({
  __esModule: true,
  usePlausible: jest.fn()
}))

const mockUsePlausible = usePlausible as jest.MockedFunction<
  typeof usePlausible
>

jest.mock('next-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

jest.mock('formik', () => ({
  __esModule: true,
  useFormikContext: jest.fn()
}))

const block: TreeBlock<ButtonFields> = {
  __typename: 'ButtonBlock',
  id: 'button',
  parentBlockId: 'question',
  parentOrder: 0,
  label: 'This is a button',
  buttonVariant: ButtonVariant.contained,
  buttonColor: ButtonColor.primary,
  size: ButtonSize.small,
  startIconId: null,
  endIconId: null,
  action: null,
  submitEnabled: false,
  settings: {
    __typename: 'ButtonBlockSettings',
    alignment: ButtonAlignment.justify
  },
  children: []
}

const activeBlock: TreeBlock<StepBlock> = {
  __typename: 'StepBlock',
  id: 'step.id',
  parentBlockId: null,
  parentOrder: 0,
  locked: true,
  nextBlockId: null,
  slug: null,
  children: [
    {
      __typename: 'CardBlock',
      id: 'card.id',
      parentBlockId: null,
      parentOrder: null,
      backgroundColor: null,
      coverBlockId: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      backdropBlur: null,
      children: [
        {
          __typename: 'TypographyBlock',
          id: 'typog.id',
          content: 'stepName',
          parentBlockId: null,
          align: null,
          color: null,
          variant: null,
          parentOrder: 0,
          children: [],
          settings: {
            __typename: 'TypographyBlockSettings',
            color: null
          }
        }
      ]
    }
  ]
}

const journey = {
  id: 'journey.id'
} as unknown as Journey

describe('Button', () => {
  const originalLocation = window.location
  const mockOrigin = 'https://example.com'

  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      value: {
        origin: mockOrigin
      }
    })
  })

  afterAll(() => {
    Object.defineProperty(window, 'location', originalLocation)
  })

  describe('form validation handling', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    const submitButtonMock = {
      ...block,
      label: 'Submit Form',
      submitEnabled: true
    }

    const mockButtonClickEvent = {
      request: {
        query: BUTTON_CLICK_EVENT_CREATE,
        variables: {
          input: {
            id: 'uuid',
            blockId: 'button',
            stepId: 'step.id',
            label: 'stepName',
            value: 'Submit Form',
            action: undefined,
            actionValue: undefined
          }
        }
      },
      result: jest.fn(() => ({
        data: {
          buttonClickEventCreate: {
            id: 'uuid',
            __typename: 'ButtonClickEvent',
            action: undefined,
            actionValue: undefined
          }
        }
      }))
    }

    it('should not submit form on empty form', async () => {
      mockUuidv4.mockReturnValueOnce('uuid')
      const validateFormMock = jest.fn().mockResolvedValue({})
      const handleSubmitMock = jest.fn()

      blockHistoryVar([activeBlock])
      treeBlocksVar([activeBlock])

      const formikContextMock = {
        values: { field1: '', field2: '' },
        validateForm: validateFormMock,
        handleSubmit: handleSubmitMock
      }

      const useFormikContextMock = useFormikContext as jest.Mock
      useFormikContextMock.mockReturnValue(formikContextMock)

      render(
        <MockedProvider mocks={[mockButtonClickEvent]}>
          <Button {...submitButtonMock} />
        </MockedProvider>
      )

      const submitButton = screen.getByRole('button', { name: 'Submit Form' })

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(validateFormMock).toHaveBeenCalled()
        expect(mockButtonClickEvent.result).toHaveBeenCalled()
        expect(handleSubmitMock).not.toHaveBeenCalled()
      })
    })

    it('should prevent handleAction when validaton fails', async () => {
      mockUuidv4.mockReturnValueOnce('uuid')
      const validateFormMock = jest.fn().mockResolvedValue({
        field1: 'Error'
      })
      const handleSubmitMock = jest.fn()

      blockHistoryVar([activeBlock])
      treeBlocksVar([activeBlock])

      const formikContextMock = {
        values: { field1: 'asd', field2: '' },
        validateForm: validateFormMock,
        handleSubmit: handleSubmitMock
      }

      const useFormikContextMock = useFormikContext as jest.Mock
      useFormikContextMock.mockReturnValue(formikContextMock)

      render(
        <MockedProvider mocks={[mockButtonClickEvent]}>
          <Button {...submitButtonMock} />
        </MockedProvider>
      )

      const submitButton = screen.getByRole('button', { name: 'Submit Form' })

      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(validateFormMock).toHaveBeenCalled()
        expect(mockButtonClickEvent.result).not.toHaveBeenCalled()
        expect(handleAction).not.toHaveBeenCalled()
      })
    })

    it('should create button click event if form is valid and not empty', async () => {
      mockUuidv4.mockReturnValueOnce('uuid')
      const validateFormMock = jest.fn().mockResolvedValue({})
      const handleSubmitMock = jest.fn()

      blockHistoryVar([activeBlock])
      treeBlocksVar([activeBlock])

      const formikContextMock = {
        values: { field1: 'asd', field2: '' },
        validateForm: validateFormMock,
        handleSubmit: handleSubmitMock
      }

      const useFormikContextMock = useFormikContext as jest.Mock
      useFormikContextMock.mockReturnValue(formikContextMock)

      render(
        <MockedProvider mocks={[mockButtonClickEvent]}>
          <JourneyProvider>
            <Button {...submitButtonMock} />
          </JourneyProvider>
        </MockedProvider>
      )

      const submitButton = screen.getByRole('button', { name: 'Submit Form' })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(validateFormMock).toHaveBeenCalled()
        expect(mockButtonClickEvent.result).toHaveBeenCalled()
        expect(handleAction).toHaveBeenCalled()
      })
    })
  })

  it('should create a buttonClickEvent onClick', async () => {
    mockUuidv4.mockReturnValueOnce('uuid')
    const mockPlausible = jest.fn()
    mockUsePlausible.mockReturnValue(mockPlausible)
    blockHistoryVar([activeBlock])
    treeBlocksVar([activeBlock])

    const action: LinkAction = {
      __typename: 'LinkAction',
      parentBlockId: 'button',
      gtmEventName: null,
      url: 'https://test.com/some-site',
      customizable: false,
      parentStepId: null
    }

    const buttonWithAction = {
      ...block,
      action
    }

    const result = jest.fn(() => ({
      data: {
        buttonClickEventCreate: {
          __typename: 'ButtonClickEvent',
          id: 'uuid',
          action: action.__typename,
          actionValue: action.url
        }
      }
    }))

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: BUTTON_CLICK_EVENT_CREATE,
              variables: {
                input: {
                  id: 'uuid',
                  blockId: 'button',
                  stepId: 'step.id',
                  label: 'stepName',
                  value: buttonWithAction.label,
                  action: action.__typename,
                  actionValue: action.url
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider value={{ journey }}>
          <Button {...buttonWithAction} />
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(mockPlausible).toHaveBeenCalledWith('buttonClick', {
      u: `${mockOrigin}/journey.id/step.id`,
      props: {
        id: 'uuid',
        blockId: 'button',
        action: 'LinkAction',
        actionValue: 'https://test.com/some-site',
        label: 'stepName',
        stepId: 'step.id',
        value: 'This is a button',
        key: keyify({
          stepId: 'step.id',
          event: 'buttonClick',
          blockId: 'button',
          target: action
        }),
        simpleKey: keyify({
          stepId: 'step.id',
          event: 'buttonClick',
          blockId: 'button'
        })
      }
    })
  })

  it('should add button_click event to dataLayer', async () => {
    mockUuidv4.mockReturnValueOnce('uuid')
    const activeBlock: TreeBlock<StepBlock> = {
      __typename: 'StepBlock',
      id: 'step.id',
      parentBlockId: null,
      parentOrder: 0,
      locked: true,
      nextBlockId: null,
      slug: null,
      children: [
        {
          __typename: 'CardBlock',
          id: 'card.id',
          parentBlockId: null,
          parentOrder: null,
          backgroundColor: null,
          coverBlockId: null,
          themeMode: null,
          themeName: null,
          fullscreen: false,
          backdropBlur: null,
          children: []
        }
      ]
    }
    blockHistoryVar([activeBlock])
    treeBlocksVar([activeBlock])

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: BUTTON_CLICK_EVENT_CREATE,
              variables: {
                input: {
                  id: 'uuid',
                  blockId: 'button',
                  stepId: 'step.id',
                  label: 'Step {{number}}',
                  value: block.label,
                  action: undefined,
                  actionValue: undefined
                }
              }
            },
            result: {
              data: {
                buttonClickEventCreate: {
                  __typename: 'ButtonClickEvent',
                  id: 'uuid',
                  action: undefined,
                  actionValue: undefined
                }
              }
            }
          }
        ]}
      >
        <JourneyProvider>
          <Button {...block} />
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() =>
      expect(mockedSendGTMEvent).toHaveBeenCalledWith({
        event: 'button_click',
        eventId: 'uuid',
        blockId: 'button',
        stepName: 'Step {{number}}'
      })
    )
  })

  it('should add LinkAction outbound_action_click event to dataLayer', async () => {
    mockUuidv4.mockReturnValueOnce('uuid')

    const action: ButtonFields_action = {
      __typename: 'LinkAction',
      parentBlockId: 'button',
      gtmEventName: 'click',
      url: 'https://bible.com',
      customizable: false,
      parentStepId: null
    }

    const buttonBlock = {
      ...block,
      action
    }

    blockHistoryVar([activeBlock])
    treeBlocksVar([activeBlock])

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: BUTTON_CLICK_EVENT_CREATE,
              variables: {
                input: {
                  id: 'uuid',
                  blockId: 'button',
                  stepId: 'step.id',
                  label: 'stepName',
                  value: buttonBlock.label,
                  action: action.__typename,
                  actionValue: action.url
                }
              }
            },
            result: {
              data: {
                buttonClickEventCreate: {
                  __typename: 'ButtonClickEvent',
                  id: 'uuid',
                  action: action.__typename,
                  actionValue: action.url
                }
              }
            }
          }
        ]}
      >
        <JourneyProvider>
          <Button {...buttonBlock} />
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button'))
    await waitFor(() =>
      expect(mockedSendGTMEvent).toHaveBeenCalledWith({
        event: 'outbound_action_click',
        eventId: 'uuid',
        blockId: 'button',
        stepName: 'stepName',
        buttonLabel: 'This is a button',
        outboundActionType: GoalType.Bible,
        outboundActionValue: 'https://bible.com'
      })
    )
  })

  it('should create a chatOpenEvent onClick', async () => {
    mockUuidv4.mockReturnValueOnce('uuid')
    const mockPlausible = jest.fn()
    mockUsePlausible.mockReturnValue(mockPlausible)
    const action: ButtonFields_action = {
      __typename: 'LinkAction',
      parentBlockId: 'button',
      gtmEventName: 'click',
      url: 'https://m.me/some-user',
      customizable: false,
      parentStepId: null
    }

    const buttonBlock = {
      ...block,
      action
    }

    blockHistoryVar([activeBlock])
    treeBlocksVar([activeBlock])

    const result = jest.fn(() => ({
      data: {
        chatOpenEventCreate: {
          __typename: 'ChatOpenEvent',
          id: 'uuid'
        }
      }
    }))

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: CHAT_OPEN_EVENT_CREATE,
              variables: {
                input: {
                  id: 'uuid',
                  blockId: 'button',
                  stepId: 'step.id',
                  value: MessagePlatform.facebook
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider value={{ journey }}>
          <Button {...buttonBlock} />
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(mockPlausible).toHaveBeenCalledWith('chatButtonClick', {
      u: `${mockOrigin}/journey.id/step.id`,
      props: {
        id: 'uuid',
        blockId: 'button',
        stepId: 'step.id',
        value: 'facebook',
        key: keyify({
          stepId: 'step.id',
          event: 'chatButtonClick',
          blockId: 'button',
          target: action
        }),
        simpleKey: keyify({
          stepId: 'step.id',
          event: 'chatButtonClick',
          blockId: 'button'
        })
      }
    })
  })

  it('should render the button successfully', () => {
    render(
      <MockedProvider>
        <Button {...block} />
      </MockedProvider>
    )
    expect(screen.getByRole('button')).toHaveClass('MuiButton-root')
    expect(screen.getByRole('button')).toHaveClass('MuiButton-contained')
    expect(screen.getByRole('button')).toHaveClass(
      'MuiButton-containedSizeSmall'
    )
    expect(screen.getByText('This is a button')).toBeInTheDocument()
  })

  it('should render with the contained value', () => {
    render(
      <MockedProvider>
        <Button {...block} buttonVariant={ButtonVariant.contained} />
      </MockedProvider>
    )
    expect(screen.getByRole('button')).toHaveClass('MuiButton-contained')
  })

  it('should render with the size value', () => {
    render(
      <MockedProvider>
        <Button {...block} size={ButtonSize.small} />
      </MockedProvider>
    )
    expect(screen.getByRole('button')).toHaveClass(
      'MuiButton-containedSizeSmall'
    )
  })

  it('should render the default color value', () => {
    render(
      <MockedProvider>
        <Button {...block} buttonColor={null} />
      </MockedProvider>
    )
    expect(screen.getByRole('button')).toHaveClass('MuiButton-containedPrimary')
  })

  it('should render the start icon', () => {
    const iconBlock: TreeBlock<ButtonFields> = {
      ...block,
      startIconId: 'start',
      children: [
        {
          id: 'start',
          __typename: 'IconBlock',
          parentBlockId: 'id',
          parentOrder: 0,
          iconName: IconName.CheckCircleRounded,
          iconColor: null,
          iconSize: IconSize.md,
          children: []
        }
      ]
    }
    render(
      <MockedProvider>
        <Button {...iconBlock} />
      </MockedProvider>
    )
    expect(screen.getByTestId('CheckCircleRoundedIcon')).toHaveClass(
      'MuiSvgIcon-root'
    )
    expect(
      screen.getByTestId('CheckCircleRoundedIcon').parentElement
    ).toHaveClass('MuiButton-startIcon')
  })

  it('should render the end icon', () => {
    const iconBlock: TreeBlock<ButtonFields> = {
      ...block,
      endIconId: 'end',
      children: [
        {
          id: 'end',
          __typename: 'IconBlock',
          parentBlockId: 'id',
          parentOrder: 0,
          iconName: IconName.CheckCircleRounded,
          iconColor: IconColor.primary,
          iconSize: IconSize.md,
          children: []
        }
      ]
    }
    render(
      <MockedProvider>
        <Button {...iconBlock} />
      </MockedProvider>
    )
    expect(screen.getByTestId('CheckCircleRoundedIcon')).toHaveClass(
      'MuiSvgIcon-root'
    )
    expect(
      screen.getByTestId('CheckCircleRoundedIcon').parentElement
    ).toHaveClass('MuiButton-endIcon')
  })

  it('should call actionHandler on click', () => {
    render(
      <MockedProvider>
        <Button
          {...block}
          action={{
            __typename: 'NavigateToBlockAction',
            parentBlockId: block.id,
            gtmEventName: 'gtmEventName',
            blockId: 'def'
          }}
        />
      </MockedProvider>
    )
    fireEvent.click(screen.getByRole('button'))
    expect(handleAction).toHaveBeenCalledWith(
      expect.objectContaining({
        push: expect.any(Function)
      }),
      {
        __typename: 'NavigateToBlockAction',
        parentBlockId: block.id,
        gtmEventName: 'gtmEventName',
        blockId: 'def'
      },
      undefined
    )
  })

  it('should show red outline when editableLabel is provided', () => {
    const EditableLabelComponent = () => (
      <span data-testid="editable-label">Edit Me</span>
    )

    const buttonWithEditableLabel = {
      ...block,
      editableLabel: <EditableLabelComponent />
    }

    render(
      <MockedProvider>
        <Button {...buttonWithEditableLabel} />
      </MockedProvider>
    )

    const button = screen.getByRole('button')
    expect(button).toHaveStyle({
      outline: '2px solid',
      outlineColor: '#C52D3A',
      outlineOffset: '5px',
      zIndex: '1'
    })
  })

  it('should not show red outline when editableLabel is not provided', () => {
    render(
      <MockedProvider>
        <Button {...block} />
      </MockedProvider>
    )

    const button = screen.getByRole('button')
    expect(button).toHaveStyle({
      outline: '2px solid',
      outlineColor: 'transparent',
      outlineOffset: '5px',
      zIndex: '0'
    })
  })

  it('should apply left alignment styles correctly', () => {
    const leftAlignedButton = {
      ...block,
      settings: {
        __typename: 'ButtonBlockSettings' as const,
        alignment: ButtonAlignment.left
      }
    }

    render(
      <MockedProvider>
        <Button {...leftAlignedButton} />
      </MockedProvider>
    )

    const buttonContainer = screen.getByTestId(`JourneysButton-${block.id}`)
    expect(buttonContainer).toHaveStyle({
      display: 'flex',
      justifyContent: 'flex-start'
    })

    const button = screen.getByRole('button')
    expect(button).toHaveStyle({
      width: 'fit-content',
      maxWidth: '75%'
    })
  })

  it('should default to justify alignment when no alignment is specified', () => {
    const buttonWithoutAlignment = {
      ...block,
      settings: null
    }

    render(
      <MockedProvider>
        <Button {...buttonWithoutAlignment} />
      </MockedProvider>
    )

    const buttonContainer = screen.getByTestId(`JourneysButton-${block.id}`)
    expect(buttonContainer).toHaveStyle({
      display: 'flex',
      justifyContent: 'space-evenly'
    })

    const button = screen.getByRole('button')
    expect(button).toHaveStyle({
      width: '100%',
      maxWidth: '100%'
    })
  })

  describe('button label rendering', () => {
    it('should display custom label when provided', () => {
      render(
        <MockedProvider>
          <Button {...block} label="Custom Label" />
        </MockedProvider>
      )
      expect(screen.getByRole('button')).toHaveTextContent('Custom Label')
    })

    it('should display "Submit" when submitEnabled is true and no label is provided', () => {
      const submitButton = {
        ...block,
        label: '',
        submitEnabled: true
      }
      render(
        <MockedProvider>
          <Button {...submitButton} />
        </MockedProvider>
      )
      expect(screen.getByRole('button')).toHaveTextContent('Submit')
    })

    it('should display "Button" when submitEnabled is false and no label is provided', () => {
      const regularButton = {
        ...block,
        label: '',
        submitEnabled: false
      }
      render(
        <MockedProvider>
          <Button {...regularButton} />
        </MockedProvider>
      )
      expect(screen.getByRole('button')).toHaveTextContent('Button')
    })

    it('should prioritize custom label over submitEnabled status', () => {
      const buttonWithLabelAndSubmitEnabled = {
        ...block,
        label: 'Custom Label',
        submitEnabled: true
      }
      render(
        <MockedProvider>
          <Button {...buttonWithLabelAndSubmitEnabled} />
        </MockedProvider>
      )
      expect(screen.getByRole('button')).toHaveTextContent('Custom Label')
    })

    it('should display editable label component when provided', () => {
      const EditableLabelComponent = () => (
        <span data-testid="editable-label">Editable Label</span>
      )

      const buttonWithEditableLabel = {
        ...block,
        label: 'Regular Label',
        editableLabel: <EditableLabelComponent />
      }

      render(
        <MockedProvider>
          <Button {...buttonWithEditableLabel} />
        </MockedProvider>
      )

      expect(screen.getByTestId('editable-label')).toBeInTheDocument()
      expect(screen.getByTestId('editable-label')).toHaveTextContent(
        'Editable Label'
      )
      expect(screen.queryByText('Regular Label')).not.toBeInTheDocument()
    })
  })

  it('should submit form when submitEnabled is true', () => {
    const emptyButtonLabelMock = {
      ...block,
      label: '',
      submitEnabled: true
    }
    render(
      <MockedProvider>
        <Button {...emptyButtonLabelMock} />
      </MockedProvider>
    )
    const submitButton = screen.getByRole('button', { name: 'Submit' })
    expect(submitButton).toHaveTextContent('Submit')
    expect(submitButton).toHaveAttribute('type', 'submit')
  })

  it('should have type="submit" when submitEnabled is true and variant is not admin', () => {
    const buttonMock = {
      ...block,
      submitEnabled: true
    }
    render(
      <MockedProvider>
        <JourneyProvider value={{ journey, variant: 'default' }}>
          <Button {...buttonMock} />
        </JourneyProvider>
      </MockedProvider>
    )
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('should have type="button" when submitEnabled is false and variant is not admin', () => {
    const buttonMock = {
      ...block,
      submitEnabled: false
    }
    render(
      <MockedProvider>
        <JourneyProvider value={{ journey, variant: 'default' }}>
          <Button {...buttonMock} />
        </JourneyProvider>
      </MockedProvider>
    )
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'button')
  })

  it('should have type="button" when submitEnabled is true and variant is admin', () => {
    const buttonMock = {
      ...block,
      submitEnabled: true,
      variant: 'admin'
    }
    render(
      <MockedProvider>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <Button {...buttonMock} />
        </JourneyProvider>
      </MockedProvider>
    )
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'button')
  })

  it('should trigger form submission when clicked in a form context', () => {
    const handleSubmit = jest.fn((e) => e.preventDefault())
    const submitButtonMock = {
      ...block,
      label: 'Submit Form',
      submitEnabled: true
    }

    render(
      <MockedProvider>
        <form onSubmit={handleSubmit} data-testid="test-form">
          <Button {...submitButtonMock} />
        </form>
      </MockedProvider>
    )

    const submitButton = screen.getByRole('button', { name: 'Submit Form' })
    expect(submitButton).toHaveAttribute('type', 'submit')

    fireEvent.click(submitButton)
    expect(handleSubmit).toHaveBeenCalledTimes(1)
  })

  describe('customization string resolution', () => {
    it('resolves label using journey customization fields on default variant', () => {
      const journeyWithFields = {
        journeyCustomizationFields: [
          {
            __typename: 'JourneyCustomizationField',
            id: '1',
            journeyId: 'journeyId',
            key: 'name',
            value: 'Alice',
            defaultValue: 'Anonymous'
          }
        ]
      } as unknown as Journey

      const btn = { ...block, label: '{{ name }}' }

      render(
        <MockedProvider>
          <JourneyProvider
            value={{ journey: journeyWithFields, variant: 'default' }}
          >
            <Button {...btn} />
          </JourneyProvider>
        </MockedProvider>
      )

      expect(screen.getByRole('button')).toHaveTextContent('Alice')
    })

    it('does not resolve label on admin variant for template journeys', () => {
      const journeyWithFields = {
        template: true,
        journeyCustomizationFields: [
          {
            __typename: 'JourneyCustomizationField',
            id: '1',
            journeyId: 'journeyId',
            key: 'name',
            value: 'Alice',
            defaultValue: 'Anonymous'
          }
        ]
      } as unknown as Journey

      const btn = { ...block, label: '{{ name }}' }

      render(
        <MockedProvider>
          <JourneyProvider
            value={{ journey: journeyWithFields, variant: 'admin' }}
          >
            <Button {...btn} />
          </JourneyProvider>
        </MockedProvider>
      )

      expect(screen.getByRole('button')).toHaveTextContent('{{ name }}')
    })

    it('replaces custom fields within mixed strings and leaves other text intact', () => {
      const journeyWithFields = {
        journeyCustomizationFields: [
          {
            __typename: 'JourneyCustomizationField',
            id: '1',
            journeyId: 'journeyId',
            key: 'name',
            value: 'Alice',
            defaultValue: 'Anonymous'
          }
        ]
      } as unknown as Journey

      const btn = { ...block, label: 'Hello {{ name }}!' }

      render(
        <MockedProvider>
          <JourneyProvider
            value={{ journey: journeyWithFields, variant: 'default' }}
          >
            <Button {...btn} />
          </JourneyProvider>
        </MockedProvider>
      )

      expect(screen.getByRole('button')).toHaveTextContent('Hello Alice!')
    })

    it('uses defaultValue when value is null', () => {
      const journeyWithFields = {
        journeyCustomizationFields: [
          {
            __typename: 'JourneyCustomizationField',
            id: '2',
            journeyId: 'journeyId',
            key: 'title',
            value: null,
            defaultValue: 'Child of God'
          }
        ]
      } as unknown as Journey

      const btn = { ...block, label: '{{ title }}' }

      render(
        <MockedProvider>
          <JourneyProvider
            value={{ journey: journeyWithFields, variant: 'default' }}
          >
            <Button {...btn} />
          </JourneyProvider>
        </MockedProvider>
      )

      expect(screen.getByRole('button')).toHaveTextContent('Child of God')
    })
  })
})
