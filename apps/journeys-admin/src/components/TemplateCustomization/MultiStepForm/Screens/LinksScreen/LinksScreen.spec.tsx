import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import { LinksScreen } from './LinksScreen'
import { BLOCK_ACTION_LINK_UPDATE } from '../../../../../libs/useBlockActionLinkUpdateMutation'
import { BLOCK_ACTION_EMAIL_UPDATE } from '../../../../../libs/useBlockActionEmailUpdateMutation'
import { JOURNEY_CHAT_BUTTON_UPDATE } from '../../../../Editor/Slider/Settings/CanvasDetails/JourneyAppearance/Chat/ChatOption/Details/Details'
import {
  BlockActionLinkUpdate,
  BlockActionLinkUpdateVariables
} from '../../../../../../__generated__/BlockActionLinkUpdate'
import {
  BlockActionEmailUpdate,
  BlockActionEmailUpdateVariables
} from '../../../../../../__generated__/BlockActionEmailUpdate'
import {
  JourneyChatButtonUpdate,
  JourneyChatButtonUpdateVariables
} from '../../../../../../__generated__/JourneyChatButtonUpdate'
import { MessagePlatform } from '../../../../../../__generated__/globalTypes'
import { JourneyLink } from '../../../utils/getJourneyLinks'

describe('LinksScreen', () => {
  const journey = {
    ...defaultJourney,
    blocks: [
      {
        id: 'step-1',
        __typename: 'StepBlock',
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: null,
        slug: 's1',
        children: []
      },
      {
        id: 'btn-1',
        __typename: 'ButtonBlock',
        parentBlockId: 'step-1',
        parentOrder: 0
      },
      {
        id: 'btn-2',
        __typename: 'ButtonBlock',
        parentBlockId: 'step-1',
        parentOrder: 1
      }
    ],
    chatButtons: [
      {
        id: 'chat-1',
        link: 'https://wa.me/123',
        platform: 'whatsApp',
        __typename: 'ChatButton'
      }
    ]
  } as unknown as Journey

  const mockLinks: JourneyLink[] = [
    {
      id: 'chat-1',
      linkType: 'chatButtons',
      url: 'https://wa.me/123',
      label: 'Chat: whatsApp'
    }
  ]

  it('renders placeholder and chat link form from journey', async () => {
    await act(async () => {
      render(
        <MockedProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <LinksScreen
              handleNext={jest.fn()}
              handleScreenNavigation={jest.fn()}
            />
          </JourneyProvider>
        </MockedProvider>
      )
    })

    expect(
      screen.getByText('This invite has buttons leading to external links')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Check them and change them here')
    ).toBeInTheDocument()
    expect(screen.getByTestId('CardsPreviewPlaceholder')).toBeInTheDocument()
    expect(screen.getByText('Chat: whatsApp')).toBeInTheDocument()
  })

  it('shows validation error for invalid chat URL on submit', async () => {
    const handleNext = jest.fn()
    await act(async () => {
      render(
        <MockedProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <LinksScreen
              handleNext={handleNext}
              handleScreenNavigation={jest.fn()}
            />
          </JourneyProvider>
        </MockedProvider>
      )
    })

    const chatGroup = screen.getByLabelText('Edit Chat: whatsApp')
    const chatInput = within(chatGroup).getByRole('textbox') as HTMLInputElement
    fireEvent.change(chatInput, { target: { value: 'wa.me/999' } })

    fireEvent.click(screen.getByRole('button', { name: 'Replace the links' }))
    await waitFor(() =>
      expect(screen.getByText('Enter a valid URL')).toBeInTheDocument()
    )
  })

  it('calls handleNext on submit (unchanged values)', async () => {
    const handleNext = jest.fn()
    await act(async () => {
      render(
        <MockedProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <LinksScreen
              handleNext={handleNext}
              handleScreenNavigation={jest.fn()}
            />
          </JourneyProvider>
        </MockedProvider>
      )
    })

    fireEvent.click(screen.getByRole('button', { name: 'Replace the links' }))
    await waitFor(() => expect(handleNext).toHaveBeenCalled())
  })

  it('calls correct mutations for changed url, email and chat values', async () => {
    const handleNext = jest.fn()

    const journeyWithLinks = {
      ...defaultJourney,
      id: 'journey-id',
      blocks: [
        {
          id: 'step-1',
          __typename: 'StepBlock',
          parentBlockId: null,
          parentOrder: 0,
          locked: false,
          nextBlockId: null,
          slug: 's1',
          children: []
        },
        {
          id: 'btn-url',
          __typename: 'ButtonBlock',
          parentBlockId: 'step-1',
          parentOrder: 0,
          label: 'Primary',
          action: {
            __typename: 'LinkAction',
            url: 'https://example.com',
            parentStepId: 'step-1',
            customizable: true
          }
        },
        {
          id: 'btn-email',
          __typename: 'ButtonBlock',
          parentBlockId: 'step-1',
          parentOrder: 1,
          label: 'Email Link',
          action: {
            __typename: 'EmailAction',
            email: 'user@example.com',
            parentStepId: 'step-1',
            customizable: true
          }
        }
      ],
      chatButtons: [
        {
          id: 'chat-1',
          link: 'https://wa.me/123',
          platform: 'whatsApp',
          __typename: 'ChatButton'
        }
      ]
    } as unknown as Journey

    const mockLinksWithMultipleTypes: JourneyLink[] = [
      {
        id: 'btn-url',
        linkType: 'url',
        url: 'https://example.com',
        label: 'Primary',
        parentStepId: 'step-1',
        customizable: true
      },
      {
        id: 'btn-email',
        linkType: 'email',
        url: 'user@example.com',
        label: 'Email Link',
        parentStepId: 'step-1',
        customizable: true
      },
      {
        id: 'chat-1',
        linkType: 'chatButtons',
        url: 'https://wa.me/123',
        label: 'Chat: whatsApp'
      }
    ]

    const linkUpdateMock: MockedResponse<
      BlockActionLinkUpdate,
      BlockActionLinkUpdateVariables
    > = {
      request: {
        query: BLOCK_ACTION_LINK_UPDATE,
        variables: {
          id: 'btn-url',
          input: {
            url: 'https://changed.com',
            customizable: true,
            parentStepId: 'step-1'
          }
        }
      },
      result: jest.fn(() => ({
        data: {
          blockUpdateLinkAction: {
            __typename: 'LinkAction',
            parentBlockId: 'btn-url',
            gtmEventName: '',
            url: 'https://changed.com',
            customizable: true,
            parentStepId: 'step-1'
          }
        }
      }))
    }

    const emailUpdateMock: MockedResponse<
      BlockActionEmailUpdate,
      BlockActionEmailUpdateVariables
    > = {
      request: {
        query: BLOCK_ACTION_EMAIL_UPDATE,
        variables: {
          id: 'btn-email',
          input: {
            email: 'changed@example.com',
            customizable: true,
            parentStepId: 'step-1'
          }
        }
      },
      result: jest.fn(() => ({
        data: {
          blockUpdateEmailAction: {
            __typename: 'EmailAction',
            parentBlockId: 'btn-email',
            gtmEventName: '',
            email: 'changed@example.com',
            customizable: true,
            parentStepId: 'step-1'
          }
        }
      }))
    }

    const chatUpdateMock: MockedResponse<
      JourneyChatButtonUpdate,
      JourneyChatButtonUpdateVariables
    > = {
      request: {
        query: JOURNEY_CHAT_BUTTON_UPDATE,
        variables: {
          chatButtonUpdateId: 'chat-1',
          journeyId: 'journey-id',
          input: {
            link: 'https://wa.me/999',
            platform: MessagePlatform.whatsApp
          }
        }
      },
      result: jest.fn(() => ({
        data: {
          chatButtonUpdate: {
            __typename: 'ChatButton',
            id: 'chat-1',
            link: 'https://wa.me/999',
            platform: MessagePlatform.whatsApp
          }
        }
      }))
    }

    await act(async () => {
      render(
        <MockedProvider
          mocks={[linkUpdateMock, emailUpdateMock, chatUpdateMock]}
        >
          <JourneyProvider
            value={{ journey: journeyWithLinks, variant: 'admin' }}
          >
            <LinksScreen
              handleNext={handleNext}
              handleScreenNavigation={jest.fn()}
            />
          </JourneyProvider>
        </MockedProvider>
      )
    })

    // Change URL field
    const urlGroup = screen.getByLabelText('Edit Primary')
    const urlInput = within(urlGroup).getByRole('textbox') as HTMLInputElement
    fireEvent.change(urlInput, { target: { value: 'https://changed.com' } })

    // Change Email field
    const emailGroup = screen.getByLabelText('Edit Email Link')
    const emailInput = within(emailGroup).getByRole(
      'textbox'
    ) as HTMLInputElement
    fireEvent.change(emailInput, { target: { value: 'changed@example.com' } })

    // Change Chat field
    const chatGroup = screen.getByLabelText('Edit Chat: whatsApp')
    const chatInput = within(chatGroup).getByRole('textbox') as HTMLInputElement
    fireEvent.change(chatInput, { target: { value: 'https://wa.me/999' } })

    fireEvent.click(screen.getByRole('button', { name: 'Replace the links' }))

    await waitFor(() => {
      expect(linkUpdateMock.result).toHaveBeenCalled()
      expect(emailUpdateMock.result).toHaveBeenCalled()
      expect(chatUpdateMock.result).toHaveBeenCalled()
      expect(handleNext).toHaveBeenCalled()
    })
  })
})
