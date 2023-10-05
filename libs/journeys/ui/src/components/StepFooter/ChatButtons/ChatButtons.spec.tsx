import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import {
  ChatPlatform,
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../../__generated__/globalTypes'
import { TreeBlock, blockHistoryVar } from '../../../libs/block'
import { BlockFields_StepBlock as StepBlock } from '../../../libs/block/__generated__/BlockFields'
import { JourneyProvider } from '../../../libs/JourneyProvider'
import {
  JourneyFields_chatButtons as ChatButton,
  JourneyFields as Journey
} from '../../../libs/JourneyProvider/__generated__/JourneyFields'

import { CHAT_BUTTON_EVENT_CREATE, ChatButtons } from './ChatButtons'

describe('ChatButtons', () => {
  const chatButtons: ChatButton[] = [
    {
      __typename: 'ChatButton',
      id: '1',
      link: 'https://m.me/',
      platform: ChatPlatform.facebook
    },
    {
      __typename: 'ChatButton',
      id: '2',
      link: 'https://other.messagingplatform/',
      platform: ChatPlatform.telegram
    }
  ]

  const stepBlock: TreeBlock<StepBlock> = {
    __typename: 'StepBlock',
    id: 'step',
    parentBlockId: null,
    parentOrder: 0,
    locked: false,
    nextBlockId: 'someId',
    children: []
  }

  const journey: Journey = {
    __typename: 'Journey',
    id: 'journeyId',
    themeName: ThemeName.base,
    themeMode: ThemeMode.light,
    featuredAt: null,
    title: 'my journey',
    strategySlug: null,
    slug: 'my-journey',
    language: {
      __typename: 'Language',
      id: '529',
      bcp47: 'en',
      iso3: 'eng',
      name: [
        {
          __typename: 'Translation',
          value: 'English',
          primary: true
        }
      ]
    },
    description: 'my cool journey',
    status: JourneyStatus.draft,
    createdAt: '2021-11-19T12:34:56.647Z',
    publishedAt: null,
    blocks: [stepBlock],
    primaryImageBlock: null,
    userJourneys: [],
    template: null,
    seoTitle: 'My awesome journey',
    seoDescription: null,
    chatButtons: [],
    host: null,
    team: null
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
            id: chatButtons[0]?.id,
            blockId: stepBlock?.id,
            stepId: stepBlock?.id,
            value: chatButtons[0].platform
          }
        }
      },
      result
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders chat buttons', () => {
    const { getAllByRole, getByTestId } = render(
      <MockedProvider>
        <JourneyProvider value={{ journey: { ...journey, chatButtons } }}>
          <ChatButtons />
        </JourneyProvider>
      </MockedProvider>
    )

    const buttons = getAllByRole('button')
    expect(buttons).toHaveLength(chatButtons.length)
    expect(getByTestId('FacebookIcon')).toBeInTheDocument()
    expect(getByTestId('TelegramIcon')).toBeInTheDocument()
  })

  it('handles button click and sends a mutation', async () => {
    window.open = jest.fn()
    blockHistoryVar([stepBlock])

    const { getAllByRole } = render(
      <MockedProvider mocks={mocks}>
        <JourneyProvider value={{ journey: { ...journey, chatButtons } }}>
          <ChatButtons />
        </JourneyProvider>
      </MockedProvider>
    )

    const buttons = getAllByRole('button')
    fireEvent.click(buttons[0])
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(window.open).toHaveBeenCalledWith(chatButtons[0].link, '_blank')
  })

  it('does not open a new window or send a mutation for admin user', async () => {
    window.open = jest.fn()

    const { getAllByRole } = render(
      <MockedProvider mocks={mocks}>
        <JourneyProvider
          value={{ journey: { ...journey, chatButtons }, variant: 'admin' }}
        >
          <ChatButtons />
        </JourneyProvider>
      </MockedProvider>
    )

    const buttons = getAllByRole('button')
    fireEvent.click(buttons[0])

    await waitFor(() => {
      expect(result).not.toHaveBeenCalled()
      expect(window.open).not.toHaveBeenCalled()
    })
  })

  it('displays a placeholder button when admin is true and there are no chat buttons', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <ChatButtons />
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByTestId('Plus2Icon')).toBeInTheDocument()
  })

  it('does not display a placeholder button when admin is false and there are no chat buttons', () => {
    const { queryByTestId } = render(
      <MockedProvider>
        <JourneyProvider value={{ journey }}>
          <ChatButtons />
        </JourneyProvider>
      </MockedProvider>
    )
    expect(queryByTestId('Plus2Icon')).not.toBeInTheDocument()
  })

  it('displays default icon when there is no platform selected', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: {
              ...journey,
              chatButtons: [{ ...chatButtons[0], platform: null }]
            }
          }}
        >
          <ChatButtons />
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByTestId('MessageTypingIcon')).toBeInTheDocument()
  })
})
