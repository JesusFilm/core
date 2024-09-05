import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { usePlausible } from 'next-plausible'
import TagManager from 'react-gtm-module'
import { v4 as uuidv4 } from 'uuid'

import {
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

jest.mock('react-gtm-module', () => ({
  __esModule: true,
  default: {
    dataLayer: jest.fn()
  }
}))

const mockedDataLayer = TagManager.dataLayer as jest.MockedFunction<
  typeof TagManager.dataLayer
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
          children: []
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
      url: 'https://test.com/some-site'
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
      expect(mockedDataLayer).toHaveBeenCalledWith({
        dataLayer: {
          event: 'button_click',
          eventId: 'uuid',
          blockId: 'button',
          stepName: 'Step {{number}}'
        }
      })
    )
  })

  it('should add LinkAction outbound_action_click event to dataLayer', async () => {
    mockUuidv4.mockReturnValueOnce('uuid')

    const action: ButtonFields_action = {
      __typename: 'LinkAction',
      parentBlockId: 'button',
      gtmEventName: 'click',
      url: 'https://bible.com'
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
      expect(mockedDataLayer).toHaveBeenCalledWith({
        dataLayer: {
          event: 'outbound_action_click',
          eventId: 'uuid',
          blockId: 'button',
          stepName: 'stepName',
          buttonLabel: 'This is a button',
          outboundActionType: GoalType.Bible,
          outboundActionValue: 'https://bible.com'
        }
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
      url: 'https://m.me/some-user'
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
      }
    )
  })

  it('should show default button text if button label is empty', () => {
    const emptyButtonLabelMock = {
      ...block,
      label: ''
    }
    render(
      <MockedProvider>
        <Button {...emptyButtonLabelMock} />
      </MockedProvider>
    )
    expect(screen.getByRole('button', { name: 'Submit' })).toHaveTextContent(
      'Submit'
    )
  })
})
