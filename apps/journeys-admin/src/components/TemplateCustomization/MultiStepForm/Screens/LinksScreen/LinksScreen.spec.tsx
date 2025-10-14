import { MockLink } from '@apollo/client/testing';
import { MockedProvider } from "@apollo/client/testing/react";
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
import { MessagePlatform } from '../../../../../../__generated__/globalTypes'
import {
  JourneyChatButtonUpdate,
  JourneyChatButtonUpdateVariables
} from '../../../../../../__generated__/JourneyChatButtonUpdate'
import { BLOCK_ACTION_EMAIL_UPDATE } from '../../../../../libs/useBlockActionEmailUpdateMutation'
import { BLOCK_ACTION_LINK_UPDATE } from '../../../../../libs/useBlockActionLinkUpdateMutation'
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
        __typename: 'ChatButton'
      }
    ]
  } as unknown as Journey

  // TODO: uncomment this when chat buttons are added to duplicate api
  // it('renders placeholder and chat link form from journey', async () => {
  //   await act(async () => {
  //     render(
  //       <MockedProvider>
  //         <JourneyProvider value={{ journey, variant: 'admin' }}>
  //           <LinksScreen
  //             handleNext={jest.fn()}
  //             handleScreenNavigation={jest.fn()}
  //           />
  //         </JourneyProvider>
  //       </MockedProvider>
  //     )
  //   })

  //   expect(
  //     screen.getAllByText(
  //       'This invite contains buttons linking to external sites. Check them and update the links below.'
  //     )[0]
  //   ).toBeInTheDocument()
  //   expect(screen.getByTestId('CardsPreviewPlaceholder')).toBeInTheDocument()
  //   expect(screen.getByText('Chat: whatsApp')).toBeInTheDocument()
  // })

  // TODO: uncomment this when chat buttons are added to duplicate api
  // it('shows validation error for invalid chat URL on submit', async () => {
  //   const handleNext = jest.fn()
  //   await act(async () => {
  //     render(
  //       <MockedProvider>
  //         <JourneyProvider value={{ journey, variant: 'admin' }}>
  //           <LinksScreen
  //             handleNext={handleNext}
  //             handleScreenNavigation={jest.fn()}
  //           />
  //         </JourneyProvider>
  //       </MockedProvider>
  //     )
  //   })

  //   const chatGroup = screen.getByLabelText('Edit Chat: whatsApp')
  //   const chatInput = within(chatGroup).getByRole('textbox') as HTMLInputElement
  //   fireEvent.change(chatInput, { target: { value: 'wa.me/999' } })

  //   fireEvent.click(screen.getByTestId('CustomizeFlowNextButton'))
  //   await waitFor(() =>
  //     expect(screen.getByText('Enter a valid URL')).toBeInTheDocument()
  //   )
  // })

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

    fireEvent.click(screen.getByTestId('CustomizeFlowNextButton'))
    await waitFor(() => expect(handleNext).toHaveBeenCalled())
  })

  it('calls correct mutations for changed url, email', async () => {
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

    const linkUpdateMock: MockLink.MockedResponse<
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

    const emailUpdateMock: MockLink.MockedResponse<
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

    // TODO: uncomment this when chat buttons are added to duplicate api
    // const chatUpdateMock: MockedResponse<
    //   JourneyChatButtonUpdate,
    //   JourneyChatButtonUpdateVariables
    // > = {
    //   request: {
    //     query: JOURNEY_CHAT_BUTTON_UPDATE,
    //     variables: {
    //       chatButtonUpdateId: 'chat-1',
    //       journeyId: 'journey-id',
    //       input: {
    //         link: 'https://wa.me/999',
    //         platform: MessagePlatform.whatsApp
    //       }
    //     }
    //   },
    //   result: jest.fn(() => ({
    //     data: {
    //       chatButtonUpdate: {
    //         __typename: 'ChatButton',
    //         id: 'chat-1',
    //         link: 'https://wa.me/999',
    //         platform: MessagePlatform.whatsApp
    //       }
    //     }
    //   }))
    // }

    await act(async () => {
      render(
        <MockedProvider mocks={[linkUpdateMock, emailUpdateMock]}>
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
    const urlInput = within(urlGroup).getByRole('textbox')
    fireEvent.change(urlInput, { target: { value: 'https://changed.com' } })

    // Change Email field
    const emailGroup = screen.getByLabelText('Edit Email Link')
    const emailInput = within(emailGroup).getByRole(
      'textbox'
    )
    fireEvent.change(emailInput, { target: { value: 'changed@example.com' } })

    // TODO: uncomment this when chat buttons are added to duplicate api
    // Change Chat field
    // const chatGroup = screen.getByLabelText('Edit Chat: whatsApp')
    // const chatInput = within(chatGroup).getByRole('textbox') as HTMLInputElement
    // fireEvent.change(chatInput, { target: { value: 'https://wa.me/999' } })

    fireEvent.click(screen.getByTestId('CustomizeFlowNextButton'))

    await waitFor(() => {
      expect(linkUpdateMock.result).toHaveBeenCalled()
      expect(emailUpdateMock.result).toHaveBeenCalled()
      // TODO: uncomment this when chat buttons are added to duplicate api
      // expect(chatUpdateMock.result).toHaveBeenCalled()
      expect(handleNext).toHaveBeenCalled()
    })
  })
})
