import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import noop from 'lodash/noop'
import { SnackbarProvider } from 'notistack'

import { ChatPlatform } from '../../../../../../../../../../__generated__/globalTypes'

import { JOURNEY_CHAT_BUTTON_UPDATE } from './Details'

import { Details } from '.'
import { ChatButtonType } from 'libs/journeys/ui/__generated__/globalTypes'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('Details', () => {
  const defaultProps = {
    journeyId: 'journeyId',
    chatButtonId: 'chat.id',
    buttonState: {
      platform: ChatPlatform.whatsApp,
      link: 'https://example.com',
      code: null,
      type: 'link'
    },
    setButtonState: noop,
    helperInfo: 'helper info',
    enableIconSelect: false,
    enableTypeToggle: false
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
      buttonState: {
        ...defaultProps.buttonState,
        platform: ChatPlatform.telegram
      }
    }

    const result = jest.fn(() => ({
      data: {
        chatButtonUpdate: {
          __typename: 'ChatButton',
          id: 'chat.id',
          link: 'https://newlink.com',
          code: null,
          type: ChatButtonType.link,
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
                chatButtonUpdateId: 'chat.id',
                journeyId: 'journeyId',
                input: {
                  link: 'https://newlink.com',
                  code: null,
                  type: ChatButtonType.link,
                  platform: ChatPlatform.telegram
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
      buttonState: {
        ...defaultProps.buttonState,
        platform: ChatPlatform.tikTok
      },
      enableIconSelect: true
    }

    const result = jest.fn(() => ({
      data: {
        chatButtonUpdate: {
          __typename: 'ChatButton',
          id: 'chat.id',
          link: 'https://example.com',
          code: null,
          type: ChatButtonType.link,
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
                chatButtonUpdateId: 'chat.id',
                journeyId: 'journeyId',
                input: {
                  link: 'https://example.com',
                  code: null,
                  type: ChatButtonType.link,
                  platform: ChatPlatform.snapchat
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

    fireEvent.mouseDown(getByRole('button', { name: 'TikTok' }))
    fireEvent.click(getByText('Snapchat'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should render button type toggle', () => {
    const props = {
      ...defaultProps,
      buttonState: {
        type: ChatButtonType.code,
        link: '',
        code: '<!-- facebook chat widget -->',
        platform: ChatPlatform.facebook
      },
      enableTypeToggle: true
    }

    const { getByRole, getByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <Details {...props} />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByRole('group')).toBeInTheDocument()
    expect(getByRole('button', { name: 'link' })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
    expect(getByRole('button', { name: 'code' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )

    expect(getByRole('textbox')).toHaveValue('<!-- facebook chat widget -->')
    expect(getByText('helper info')).toBeInTheDocument()
  })

  it('should update chatbutton code', async () => {
    const props = {
      ...defaultProps,
      buttonState: {
        type: ChatButtonType.code,
        link: 'https://example.com',
        code: '',
        platform: ChatPlatform.facebook
      }
    }

    const result = jest.fn(() => ({
      data: {
        chatButtonUpdate: {
          __typename: 'ChatButton',
          id: 'chat.id',
          link: 'https://example.com',
          code: '<!-- facebook chat widget -->',
          type: ChatButtonType.code,
          platform: ChatPlatform.facebook
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
                  code: '<!-- facebook chat widget -->',
                  type: ChatButtonType.code,
                  platform: ChatPlatform.facebook
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
      target: { value: '<!-- facebook chat widget -->' }
    })
    fireEvent.blur(getByRole('textbox'))

    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
