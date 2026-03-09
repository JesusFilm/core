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

import {
  BlockActionEmailUpdate,
  BlockActionEmailUpdateVariables
} from '../../../../../../__generated__/BlockActionEmailUpdate'
import {
  BlockActionLinkUpdate,
  BlockActionLinkUpdateVariables
} from '../../../../../../__generated__/BlockActionLinkUpdate'
import {
  BlockActionPhoneUpdate,
  BlockActionPhoneUpdateVariables
} from '../../../../../../__generated__/BlockActionPhoneUpdate'
import {
  ContactActionType,
  MessagePlatform
} from '../../../../../../__generated__/globalTypes'
import {
  JourneyChatButtonUpdate,
  JourneyChatButtonUpdateVariables
} from '../../../../../../__generated__/JourneyChatButtonUpdate'
import { BLOCK_ACTION_EMAIL_UPDATE } from '../../../../../libs/useBlockActionEmailUpdateMutation'
import { BLOCK_ACTION_LINK_UPDATE } from '../../../../../libs/useBlockActionLinkUpdateMutation'
import { BLOCK_ACTION_PHONE_UPDATE } from '../../../../../libs/useBlockActionPhoneUpdateMutation'
import { JOURNEY_CHAT_BUTTON_UPDATE } from '../../../../Editor/Slider/Settings/CanvasDetails/JourneyAppearance/Chat/ChatOption/Details/Details'
import { JourneyLink } from '../../../utils/getJourneyLinks'

import { LinksScreen } from './LinksScreen'

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
        __typename: 'ChatButton',
        customizable: true
      }
    ]
  } as unknown as Journey

  it('renders first step card preview and chat link form when only chat buttons exist', async () => {
    await act(async () => {
      render(
        <MockedProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <LinksScreen handleNext={jest.fn()} />
          </JourneyProvider>
        </MockedProvider>
      )
    })

    expect(screen.getByTestId('CardsPreviewItem')).toBeInTheDocument()
    expect(
      screen.queryByTestId('CardsPreviewPlaceholder')
    ).not.toBeInTheDocument()
    expect(screen.getByText('Chat: WhatsApp')).toBeInTheDocument()
  })

  it('shows validation error for invalid chat URL on submit', async () => {
    const handleNext = jest.fn()
    await act(async () => {
      render(
        <MockedProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <LinksScreen handleNext={handleNext} />
          </JourneyProvider>
        </MockedProvider>
      )
    })

    const chatGroup = screen.getByLabelText('Edit Chat: WhatsApp')
    const chatInput = within(chatGroup).getByRole('textbox')
    fireEvent.change(chatInput, { target: { value: 'wa.me/999' } })

    fireEvent.click(screen.getByTestId('CustomizeFlowNextButton'))
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
            <LinksScreen handleNext={handleNext} />
          </JourneyProvider>
        </MockedProvider>
      )
    })

    fireEvent.click(screen.getByTestId('CustomizeFlowNextButton'))
    await waitFor(() => expect(handleNext).toHaveBeenCalled())
  })

  it('calls correct mutations for changed url, email, and chat', async () => {
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
          __typename: 'ChatButton',
          customizable: true
        }
      ]
    } as unknown as Journey

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
            platform: MessagePlatform.whatsApp,
            customizable: true
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
            <LinksScreen handleNext={handleNext} />
          </JourneyProvider>
        </MockedProvider>
      )
    })

    const urlGroup = screen.getByLabelText('Edit Primary')
    const urlInput = within(urlGroup).getByRole('textbox')
    fireEvent.change(urlInput, { target: { value: 'https://changed.com' } })

    const emailGroup = screen.getByLabelText('Edit Email Link')
    const emailInput = within(emailGroup).getByRole('textbox')
    fireEvent.change(emailInput, { target: { value: 'changed@example.com' } })

    const chatGroup = screen.getByLabelText('Edit Chat: WhatsApp')
    const chatInput = within(chatGroup).getByRole('textbox')
    fireEvent.change(chatInput, { target: { value: 'https://wa.me/999' } })

    fireEvent.click(screen.getByTestId('CustomizeFlowNextButton'))

    await waitFor(() => {
      expect(linkUpdateMock.result).toHaveBeenCalled()
      expect(emailUpdateMock.result).toHaveBeenCalled()
      expect(chatUpdateMock.result).toHaveBeenCalled()
      expect(handleNext).toHaveBeenCalled()
    })
  })

  it('accepts phone numbers and calls phone update mutation', async () => {
    const handleNext = jest.fn()
    const journeyWithPhone = {
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
          id: 'btn-phone',
          __typename: 'ButtonBlock',
          parentBlockId: 'step-1',
          parentOrder: 0,
          label: 'Call Us',
          action: {
            __typename: 'PhoneAction',
            phone: '+6434953',
            countryCode: 'NZ',
            contactAction: ContactActionType.call,
            parentStepId: 'step-1',
            customizable: true
          }
        }
      ]
    } as unknown as Journey

    const phoneUpdateMock: MockedResponse<
      BlockActionPhoneUpdate,
      BlockActionPhoneUpdateVariables
    > = {
      request: {
        query: BLOCK_ACTION_PHONE_UPDATE,
        variables: {
          id: 'btn-phone',
          input: {
            phone: '+64987654321',
            countryCode: 'NZ',
            contactAction: ContactActionType.call,
            customizable: true,
            parentStepId: 'step-1'
          }
        }
      },
      result: jest.fn(() => ({
        data: {
          blockUpdatePhoneAction: {
            __typename: 'PhoneAction',
            parentBlockId: 'btn-phone',
            gtmEventName: '',
            phone: '+64987654321',
            countryCode: 'NZ',
            contactAction: ContactActionType.call,
            customizable: true,
            parentStepId: 'step-1'
          }
        }
      }))
    }

    await act(async () => {
      render(
        <MockedProvider mocks={[phoneUpdateMock]}>
          <JourneyProvider
            value={{ journey: journeyWithPhone, variant: 'admin' }}
          >
            <LinksScreen handleNext={handleNext} />
          </JourneyProvider>
        </MockedProvider>
      )
    })

    const phoneLabel = screen.getByText('Call Us')
    expect(phoneLabel).toBeInTheDocument()
    const phoneNumberInput = screen.getByRole('textbox', {
      name: 'Phone Number'
    })
    fireEvent.change(phoneNumberInput, { target: { value: '987654321' } })
    fireEvent.blur(phoneNumberInput)

    await waitFor(() => {
      expect(phoneNumberInput).toHaveValue('987654321')
    })

    fireEvent.click(screen.getByTestId('CustomizeFlowNextButton'))

    await waitFor(() => {
      expect(phoneUpdateMock.result).toHaveBeenCalled()
      expect(handleNext).toHaveBeenCalled()
    })
  })

  it('shows validation error for invalid phone input', async () => {
    await act(async () => {
      render(
        <MockedProvider>
          <JourneyProvider
            value={{
              journey: {
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
                    id: 'btn-phone',
                    __typename: 'ButtonBlock',
                    parentBlockId: 'step-1',
                    parentOrder: 0,
                    label: 'Support',
                    action: {
                      __typename: 'PhoneAction',
                      phone: '+123456789',
                      countryCode: 'US',
                      contactAction: ContactActionType.call,
                      parentStepId: 'step-1',
                      customizable: true
                    }
                  }
                ]
              } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <LinksScreen handleNext={jest.fn()} />
          </JourneyProvider>
        </MockedProvider>
      )
    })

    const phoneLabel = screen.getByText('Support')
    expect(phoneLabel).toBeInTheDocument()
    const phoneNumberInput = screen.getByRole('textbox', {
      name: 'Phone Number'
    })
    fireEvent.change(phoneNumberInput, { target: { value: 'not-a-phone' } })
    fireEvent.blur(phoneNumberInput)

    await waitFor(() => {
      expect(phoneNumberInput).toHaveValue('not-a-phone')
    })

    fireEvent.click(screen.getByTestId('CustomizeFlowNextButton'))
    await waitFor(() =>
      expect(
        screen.getByText('Phone number must use valid digits.')
      ).toBeInTheDocument()
    )
  })
})
