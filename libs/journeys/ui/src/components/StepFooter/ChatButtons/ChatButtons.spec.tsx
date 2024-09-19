import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { usePlausible } from 'next-plausible'

import { MessagePlatform } from '../../../../__generated__/globalTypes'
import { TreeBlock, blockHistoryVar } from '../../../libs/block'
import { BlockFields_StepBlock as StepBlock } from '../../../libs/block/__generated__/BlockFields'
import { JourneyProvider } from '../../../libs/JourneyProvider'
import {
  JourneyFields_chatButtons as ChatButton,
  JourneyFields as Journey
} from '../../../libs/JourneyProvider/__generated__/JourneyFields'
import { keyify } from '../../../libs/plausibleHelpers'
import { defaultJourney } from '../../TemplateView/data'

import { CHAT_BUTTON_EVENT_CREATE, ChatButtons } from './ChatButtons'

jest.mock('next-plausible', () => ({
  __esModule: true,
  usePlausible: jest.fn()
}))

const mockUsePlausible = usePlausible as jest.MockedFunction<
  typeof usePlausible
>

describe('ChatButtons', () => {
  const chatButtons: ChatButton[] = [
    {
      __typename: 'ChatButton',
      id: '1',
      link: 'https://m.me/',
      platform: MessagePlatform.facebook
    },
    {
      __typename: 'ChatButton',
      id: '2',
      link: 'https://other.messagingplatform/',
      platform: MessagePlatform.telegram
    }
  ]

  const stepBlock: TreeBlock<StepBlock> = {
    __typename: 'StepBlock',
    id: 'step',
    parentBlockId: null,
    parentOrder: 0,
    locked: false,
    nextBlockId: 'someId',
    slug: null,
    children: []
  }

  const journey: Journey = {
    ...defaultJourney,
    id: 'journeyId',
    blocks: [stepBlock],
    chatButtons: []
  }

  const result = jest.fn(() => ({
    data: {
      chatOpenEventCreate: {
        __typename: 'ChatOpenEvent',
        id: chatButtons[0]?.id
      }
    }
  }))

  const mocks = [
    {
      request: {
        query: CHAT_BUTTON_EVENT_CREATE,
        variables: {
          input: {
            blockId: stepBlock?.id,
            stepId: stepBlock?.id,
            value: chatButtons[0].platform
          }
        }
      },
      result
    }
  ]

  const originalLocation = window.location
  const mockOrigin = 'https://example.com'

  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      value: {
        origin: mockOrigin
      }
    })
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    Object.defineProperty(window, 'location', originalLocation)
  })

  it('renders chat buttons', () => {
    render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: { ...journey, chatButtons, showChatButtons: true }
          }}
        >
          <ChatButtons />
        </JourneyProvider>
      </MockedProvider>
    )

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(chatButtons.length)
    expect(screen.getByTestId('FacebookIcon')).toBeInTheDocument()
    expect(screen.getByTestId('TelegramIcon')).toBeInTheDocument()
  })

  it('handles button click and sends a mutation', async () => {
    window.open = jest.fn()
    blockHistoryVar([stepBlock])
    const mockPlausible = jest.fn()
    mockUsePlausible.mockReturnValue(mockPlausible)

    render(
      <MockedProvider mocks={mocks}>
        <JourneyProvider
          value={{
            journey: { ...journey, chatButtons, showChatButtons: true }
          }}
        >
          <ChatButtons />
        </JourneyProvider>
      </MockedProvider>
    )

    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[0])
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(window.open).toHaveBeenCalledWith(chatButtons[0].link, '_blank')
    expect(mockPlausible).toHaveBeenCalledWith('footerChatButtonClick', {
      u: `${mockOrigin}/journeyId/step`,
      props: {
        id: '1',
        blockId: 'step',
        stepId: 'step',
        value: 'facebook',
        key: keyify({
          stepId: 'step',
          event: 'footerChatButtonClick',
          blockId: 'step',
          target: 'link:https://m.me/:facebook'
        }),
        simpleKey: keyify({
          stepId: 'step',
          event: 'footerChatButtonClick',
          blockId: 'step'
        })
      }
    })
  })

  it('does not open a new window or send a mutation for admin user', async () => {
    window.open = jest.fn()

    render(
      <MockedProvider mocks={mocks}>
        <JourneyProvider
          value={{
            journey: { ...journey, chatButtons, showChatButtons: true },
            variant: 'admin'
          }}
        >
          <ChatButtons />
        </JourneyProvider>
      </MockedProvider>
    )

    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[0])

    await waitFor(() => {
      expect(result).not.toHaveBeenCalled()
      expect(window.open).not.toHaveBeenCalled()
    })
  })

  it('displays a placeholder button when admin is true and showChatButtons is falsy', () => {
    render(
      <MockedProvider>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <ChatButtons />
        </JourneyProvider>
      </MockedProvider>
    )
    expect(screen.getByTestId('Plus2Icon')).toBeInTheDocument()
  })

  it('does not display a placeholder button when admin is false and showChatButtons is falsy', () => {
    render(
      <MockedProvider>
        <JourneyProvider value={{ journey }}>
          <ChatButtons />
        </JourneyProvider>
      </MockedProvider>
    )
    expect(screen.queryByTestId('Plus2Icon')).not.toBeInTheDocument()
  })

  it('should display the empty state when on admin and showChatButtons is true', () => {
    render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: { ...journey, showChatButtons: true },
            variant: 'admin'
          }}
        >
          <ChatButtons />
        </JourneyProvider>
      </MockedProvider>
    )
    expect(screen.getByTestId('MessageTypingIcon')).toBeInTheDocument()
  })

  it('should not display the empty state when not on admin and showChatButtons is true', () => {
    render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: { ...journey, showChatButtons: true }
          }}
        >
          <ChatButtons />
        </JourneyProvider>
      </MockedProvider>
    )
    expect(screen.queryByTestId('MessageTypingIcon')).not.toBeInTheDocument()
  })

  it('displays default icon when there is no platform selected', () => {
    render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: {
              ...journey,
              showChatButtons: true,
              chatButtons: [{ ...chatButtons[0], platform: null }]
            }
          }}
        >
          <ChatButtons />
        </JourneyProvider>
      </MockedProvider>
    )
    expect(screen.getByTestId('MessageTypingIcon')).toBeInTheDocument()
  })
})
