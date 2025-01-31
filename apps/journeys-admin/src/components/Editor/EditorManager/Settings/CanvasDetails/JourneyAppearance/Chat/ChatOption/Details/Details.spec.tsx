import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import noop from 'lodash/noop'
import { SnackbarProvider } from 'notistack'

import { MessagePlatform } from '../../../../../../../../../../__generated__/globalTypes'

import { JOURNEY_CHAT_BUTTON_UPDATE } from './Details'

import { Details } from '.'

describe('Details', () => {
  const defaultProps = {
    journeyId: 'journeyId',
    chatButtonId: 'chat.id',
    currentPlatform: MessagePlatform.whatsApp,
    currentLink: 'https://example.com',
    setCurrentPlatform: noop,
    setCurrentLink: noop,
    helperInfo: 'helper info',
    enableIconSelect: false
  }

  it('should render', () => {
    const { getByRole, getByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <Details {...defaultProps} />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByRole('textbox')).toHaveValue('https://example.com')
    expect(getByText('helper info')).toBeInTheDocument()
  })

  it('should update link', async () => {
    const props = {
      ...defaultProps,
      currentPlatform: MessagePlatform.telegram
    }

    const result = jest.fn(() => ({
      data: {
        chatButtonUpdate: {
          __typename: 'ChatButton',
          id: 'chat.id',
          link: 'https://newlink.com',
          platform: MessagePlatform.telegram
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
                chatButtonUpdateId: 'chat.id',
                journeyId: 'journeyId',
                input: {
                  link: 'https://newlink.com',
                  platform: MessagePlatform.telegram
                }
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <Details {...props} />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.change(getByRole('textbox'), {
      target: { value: 'https://newlink.com' }
    })
    fireEvent.blur(getByRole('textbox'))

    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should update link with a protocol', async () => {
    const props = {
      ...defaultProps,
      currentPlatform: MessagePlatform.telegram
    }

    const result = jest.fn(() => ({
      data: {
        chatButtonUpdate: {
          __typename: 'ChatButton',
          id: 'chat.id',
          link: 'newlink.com',
          platform: MessagePlatform.telegram
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
                chatButtonUpdateId: 'chat.id',
                journeyId: 'journeyId',
                input: {
                  link: 'https://newlink.com',
                  platform: MessagePlatform.telegram
                }
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <Details {...props} />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.change(getByRole('textbox'), {
      target: { value: 'https://newlink.com' }
    })
    fireEvent.blur(getByRole('textbox'))

    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should update platform', async () => {
    const props = {
      ...defaultProps,
      currentPlatform: MessagePlatform.tikTok,
      enableIconSelect: true
    }

    const result = jest.fn(() => ({
      data: {
        chatButtonUpdate: {
          __typename: 'ChatButton',
          id: 'chat.id',
          link: 'https://example.com',
          platform: MessagePlatform.snapchat
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
                chatButtonUpdateId: 'chat.id',
                journeyId: 'journeyId',
                input: {
                  link: 'https://example.com',
                  platform: MessagePlatform.snapchat
                }
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <Details {...props} />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.mouseDown(getByRole('combobox'))
    fireEvent.click(getByText('Snapchat'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
