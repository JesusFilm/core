import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { CommandProvider } from '@core/journeys/ui/CommandProvider'

import { MessagePlatform } from '../../../../../../../../../__generated__/globalTypes'
import {
  JourneyChatButtonUpdate,
  JourneyChatButtonUpdateVariables
} from '../../../../../../../../../__generated__/JourneyChatButtonUpdate'
import { JourneyFields_chatButtons as ChatButton } from '../../../../../../../../../__generated__/JourneyFields'

import { JOURNEY_CHAT_BUTTON_UPDATE } from './Details/Details'

import { ChatOption } from '.'

describe('ChatOption', () => {
  it('should render', () => {
    const props = {
      title: 'title',
      chatButton: {
        id: 'chatButton.id',
        link: 'https://example.com',
        platform: MessagePlatform.facebook
      } as unknown as ChatButton,
      platform: MessagePlatform.facebook,
      active: true,
      helperInfo: 'helper info',
      journeyId: 'journeyId',
      disableSelection: false
    }

    render(
      <MockedProvider>
        <SnackbarProvider>
          <ChatOption {...props} />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByText(props.title)).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveValue('https://example.com')
  })

  it('should update currentLink locally', () => {
    const props = {
      title: 'title',
      chatButton: {
        id: 'chatButton.id',
        link: 'https://example.com',
        platform: MessagePlatform.whatsApp
      } as unknown as ChatButton,
      platform: MessagePlatform.whatsApp,
      active: true,
      helperInfo: 'helper info',
      journeyId: 'journeyId',
      disableSelection: false
    }

    render(
      <MockedProvider>
        <SnackbarProvider>
          <ChatOption {...props} />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'https://newlink.com' }
    })
    expect(screen.getByRole('textbox')).toHaveValue('https://newlink.com')
  })

  it('should update currentPlatform locally', async () => {
    const props = {
      title: 'title',
      chatButton: {
        id: 'chatButton.id',
        link: 'https://example.com',
        platform: MessagePlatform.tikTok
      } as unknown as ChatButton,
      platform: MessagePlatform.tikTok,
      active: true,
      helperInfo: 'helper info',
      journeyId: 'journeyId',
      disableSelection: false,
      enableIconSelect: true
    }

    const updateResult = vi.fn(() => ({
      data: {
        chatButtonUpdate: {
          __typename: 'ChatButton' as const,
          id: 'chatButton.id',
          link: 'https://example.com',
          platform: MessagePlatform.snapchat,
          customizable: null
        }
      }
    }))

    const updateMock: MockedResponse<
      JourneyChatButtonUpdate,
      JourneyChatButtonUpdateVariables
    > = {
      request: {
        query: JOURNEY_CHAT_BUTTON_UPDATE,
        variables: {
          chatButtonUpdateId: 'chatButton.id',
          journeyId: 'journeyId',
          input: { platform: MessagePlatform.snapchat }
        }
      },
      result: updateResult
    }

    render(
      <MockedProvider mocks={[updateMock]}>
        <SnackbarProvider>
          <CommandProvider>
            <ChatOption {...props} />
          </CommandProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByText('TikTok'))
    fireEvent.click(screen.getByText('Snapchat'))
    expect(screen.getByRole('combobox')).toHaveTextContent('Snapchat')
    await waitFor(() => expect(updateResult).toHaveBeenCalled())
  })

  it('should sync state when chatButton changes to a different button', () => {
    const initialProps = {
      title: 'Custom',
      chatButton: {
        id: 'button-1',
        link: 'https://first.com',
        platform: MessagePlatform.tikTok
      } as unknown as ChatButton,
      active: true,
      journeyId: 'journeyId',
      disableSelection: false,
      enableIconSelect: true
    }

    const { rerender } = render(
      <MockedProvider>
        <SnackbarProvider>
          <ChatOption {...initialProps} />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('textbox')).toHaveValue('https://first.com')
    expect(screen.getByRole('combobox')).toHaveTextContent('TikTok')

    rerender(
      <MockedProvider>
        <SnackbarProvider>
          <ChatOption
            {...initialProps}
            chatButton={
              {
                id: 'button-2',
                link: 'https://second.com',
                platform: MessagePlatform.snapchat
              } as unknown as ChatButton
            }
          />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('textbox')).toHaveValue('https://second.com')
    expect(screen.getByRole('combobox')).toHaveTextContent('Snapchat')
  })

  it('should preserve state when chatButton becomes undefined', () => {
    const initialProps = {
      title: 'Custom',
      chatButton: {
        id: 'button-1',
        link: 'https://preserved.com',
        platform: MessagePlatform.tikTok
      } as unknown as ChatButton,
      active: true,
      journeyId: 'journeyId',
      disableSelection: false,
      enableIconSelect: true
    }

    const { rerender } = render(
      <MockedProvider>
        <SnackbarProvider>
          <ChatOption {...initialProps} />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('textbox')).toHaveValue('https://preserved.com')
    expect(screen.getByRole('combobox')).toHaveTextContent('TikTok')

    rerender(
      <MockedProvider>
        <SnackbarProvider>
          <ChatOption {...initialProps} chatButton={undefined} active={false} />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByRole('textbox')).toHaveValue('https://preserved.com')
    expect(screen.getByRole('combobox')).toHaveTextContent('TikTok')
  })
})
