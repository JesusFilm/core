import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { InMemoryCache } from '@apollo/client'
import { ChatPlatform } from '../../../../../../../../../__generated__/globalTypes'
import { JourneyFields_chatButtons as ChatButton } from '../../../../../../../../../__generated__/JourneyFields'
import {
  JOURNEY_CHAT_BUTTON_CREATE,
  JOURNEY_CHAT_BUTTON_UPDATE,
  JOURNEY_CHAT_BUTTON_REMOVE
} from './ChatOption'
import { ChatOption } from '.'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('Chat', () => {
  const defaultProps = {
    title: 'Default Option',
    chatButton: undefined,
    platform: ChatPlatform.facebook,
    active: false,
    journeyId: 'journeyId',
    disableSelection: false
  }

  it('should create chat button and add to cache', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        __typename: 'Journey',
        id: 'journeyId',
        chatButtons: []
      }
    })

    const result = jest.fn(() => ({
      data: {
        chatButtonCreate: {
          __typename: 'ChatButton',
          id: 'chat1.id',
          link: '',
          platform: ChatPlatform.facebook
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        cache={cache}
        mocks={[
          {
            request: {
              query: JOURNEY_CHAT_BUTTON_CREATE,
              variables: {
                journeyId: 'journeyId',
                input: {
                  link: '',
                  platform: ChatPlatform.facebook
                }
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <ChatOption {...defaultProps} />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByRole('checkbox')).not.toBeChecked()
    fireEvent.click(getByRole('checkbox'))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(cache.extract()['Journey:journeyId']?.chatButtons).toEqual([
      { __ref: 'ChatButton:chat1.id' }
    ])
  })

  it('should remove chat button and remove from cache', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        __typename: 'Journey',
        id: 'journeyId',
        chatButtons: [
          {
            __ref: 'ChatButton:chat1.id'
          }
        ]
      },
      'ChatButton:chat1.id': {
        __typename: 'ChatButton',
        id: 'chat1.id',
        link: 'https://example.com',
        platform: ChatPlatform.facebook
      }
    })

    const props = {
      ...defaultProps,
      chatButton: {
        __typename: 'ChatButton',
        id: 'chat1.id',
        link: 'https://example.com',
        platform: ChatPlatform.whatsApp
      } as unknown as ChatButton,
      platform: ChatPlatform.whatsApp,
      active: true,
      disableSelection: true
    }

    const result = jest.fn(() => ({
      data: {
        chatButtonRemove: {
          __typename: 'ChatButton',
          id: 'chat1.id'
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        cache={cache}
        mocks={[
          {
            request: {
              query: JOURNEY_CHAT_BUTTON_REMOVE,
              variables: {
                chatButtonRemoveId: 'chat1.id'
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <ChatOption {...props} />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByRole('checkbox')).toBeChecked()
    fireEvent.click(getByRole('checkbox'))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(cache.extract()['Journey:journeyId']?.chatButtons).toEqual([])
  })

  it('should update link', async () => {
    const props = {
      ...defaultProps,
      chatButton: {
        __typename: 'ChatButton',
        id: 'chat1.id',
        link: 'https://example.com',
        platform: ChatPlatform.telegram
      } as unknown as ChatButton,
      platform: ChatPlatform.telegram,
      active: true
    }

    const result = jest.fn(() => ({
      data: {
        chatButtonUpdate: {
          __typename: 'ChatButton',
          id: 'chat1.id',
          link: 'https://newlink.com',
          platform: ChatPlatform.telegram
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_CHAT_BUTTON_UPDATE,
              variables: {
                chatButtonUpdateId: 'chat1.id',
                journeyId: 'journeyId',
                input: {
                  link: 'https://newlink.com',
                  platform: ChatPlatform.telegram
                }
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <ChatOption {...props} />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Default Option' }))
    fireEvent.change(getByRole('textbox'), {
      target: { value: 'https://newlink.com' }
    })
    fireEvent.blur(getByRole('textbox'))

    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should update platform', async () => {
    const props = {
      ...defaultProps,
      chatButton: {
        __typename: 'ChatButton',
        id: 'chat1.id',
        link: 'https://example.com',
        platform: undefined
      } as unknown as ChatButton,
      platform: undefined,
      active: true,
      enableIconSelect: true
    }

    const result = jest.fn(() => ({
      data: {
        chatButtonUpdate: {
          __typename: 'ChatButton',
          id: 'chat1.id',
          link: 'https://example.com',
          platform: ChatPlatform.snapchat
        }
      }
    }))

    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: JOURNEY_CHAT_BUTTON_UPDATE,
              variables: {
                chatButtonUpdateId: 'chat1.id',
                journeyId: 'journeyId',
                input: {
                  link: 'https://example.com',
                  platform: ChatPlatform.snapchat
                }
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <ChatOption {...props} />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Default Option' }))
    fireEvent.mouseDown(getByRole('button', { name: 'Select an icon...' }))
    fireEvent.click(getByText('Snapchat'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should disable if not selected', () => {
    const props = {
      ...defaultProps,
      disableSelection: true
    }

    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <ChatOption {...props} />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByRole('checkbox')).toBeDisabled()
  })

  it('should show helper info', () => {
    const props = {
      ...defaultProps,
      helperInfo: 'helper text'
    }

    const { getByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <ChatOption {...props} />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByText('helper text')).toBeInTheDocument()
  })
})
