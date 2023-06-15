import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { ChatPlatform } from '../../../../../../../../__generated__/globalTypes'
import {
  GET_JOURNEY_CHAT_BUTTONS,
  JOURNEY_CHAT_BUTTON_CREATE,
  JOURNEY_CHAT_BUTTON_UPDATE,
  JOURNEY_CHAT_BUTTON_REMOVE
} from './Chat'
import { Chat } from '.'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('Chat', () => {
  it('should render with data from query', async () => {
    const result = jest.fn(() => ({
      data: {
        journey: {
          chatButtons: [
            {
              __typename: 'ChatButton',
              id: 'chat1.id',
              link: 'test link',
              platform: ChatPlatform.facebook
            }
          ]
        }
      }
    }))
    const { getByRole, getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_JOURNEY_CHAT_BUTTONS,
              variables: {
                id: '1'
              }
            },
            result
          }
        ]}
      >
        <Chat journeyId="1" />
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(getByRole('button', { name: 'Facebook Messenger' }))

    expect(getByTestId('checkbox-facebook')).toHaveClass('Mui-checked')
    expect(getByTestId('checkbox-whatsApp')).not.toHaveClass('Mui-checked')
    expect(getByTestId('checkbox-telegram')).not.toHaveClass('Mui-checked')
    expect(getByTestId('checkbox-custom')).not.toHaveClass('Mui-checked')

    expect(getByRole('textbox')).toHaveValue('test link')
  })

  it('should disable selection if there are already 2 platforms', async () => {
    const result = jest.fn(() => ({
      data: {
        journey: {
          chatButtons: [
            {
              __typename: 'ChatButton',
              id: 'chat1.id',
              link: 'chat 1 test link',
              platform: ChatPlatform.whatsApp
            },
            {
              __typename: 'ChatButton',
              id: 'chat2.id',
              link: 'chat 2 test link',
              platform: ChatPlatform.tikTok
            }
          ]
        }
      }
    }))
    const { getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_JOURNEY_CHAT_BUTTONS,
              variables: {
                id: '1'
              }
            },
            result
          }
        ]}
      >
        <Chat journeyId="1" />
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())

    expect(getByTestId('checkbox-facebook')).not.toHaveClass('Mui-checked')
    expect(getByTestId('checkbox-whatsApp')).toHaveClass('Mui-checked')
    expect(getByTestId('checkbox-telegram')).not.toHaveClass('Mui-checked')
    expect(getByTestId('checkbox-tikTok')).toHaveClass('Mui-checked')
  })

  it('should allow typing if platform is not selected', async () => {
    const result = jest.fn(() => ({
      data: {
        journey: {
          chatButtons: [
            {
              __typename: 'ChatButton',
              id: 'chat1.id',
              link: 'chat 1 test link',
              platform: ChatPlatform.whatsApp
            },
            {
              __typename: 'ChatButton',
              id: 'chat2.id',
              link: 'chat 2 test link',
              platform: ChatPlatform.tikTok
            }
          ]
        }
      }
    }))
    const { getByRole, getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_JOURNEY_CHAT_BUTTONS,
              variables: {
                id: '1'
              }
            },
            result
          }
        ]}
      >
        <Chat journeyId="1" />
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(getByTestId('checkbox-telegram')).not.toHaveClass('Mui-checked')
    fireEvent.click(getByRole('button', { name: 'Telegram' }))
    fireEvent.change(getByRole('textbox'), {
      target: { value: 'new link' }
    })

    expect(getByRole('textbox')).toHaveValue('new link')
  })

  it('should add a new chat button', async () => {
    const createMutationResult = jest.fn(() => ({
      data: {
        chatButtonCreate: {
          id: 'uuid',
          link: '',
          platform: ChatPlatform.facebook
        }
      }
    }))

    const { getAllByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_JOURNEY_CHAT_BUTTONS,
              variables: {
                id: '1'
              }
            },
            result: { data: { journey: { chatButtons: [] } } }
          },
          {
            request: {
              query: JOURNEY_CHAT_BUTTON_CREATE,
              variables: {
                journeyId: '1',
                input: {
                  link: '',
                  platform: ChatPlatform.facebook
                }
              }
            },
            result: createMutationResult
          }
        ]}
      >
        <Chat journeyId="1" />
      </MockedProvider>
    )

    fireEvent.click(getAllByRole('checkbox')[0])
    await waitFor(() => expect(createMutationResult).toHaveBeenCalled())
  })

  it('should update a chat button ', async () => {
    const result = jest.fn(() => ({
      data: {
        journey: {
          chatButtons: [
            {
              __typename: 'ChatButton',
              id: 'chat1.id',
              link: 'test link',
              platform: ChatPlatform.facebook
            }
          ]
        }
      }
    }))

    const updateMutationResult = jest.fn(() => ({
      data: {
        chatButtonUpdate: {
          id: 'chat1.id',
          link: 'new link',
          platform: ChatPlatform.facebook
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_JOURNEY_CHAT_BUTTONS,
              variables: {
                id: '1'
              }
            },
            result
          },
          {
            request: {
              query: JOURNEY_CHAT_BUTTON_UPDATE,
              variables: {
                chatButtonUpdateId: 'chat1.id',
                journeyId: '1',
                input: {
                  link: 'new link',
                  platform: ChatPlatform.facebook
                }
              }
            },
            result: updateMutationResult
          }
        ]}
      >
        <Chat journeyId="1" />
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(getByRole('button', { name: 'Facebook Messenger' }))
    fireEvent.change(getByRole('textbox'), { target: { value: 'new link' } })
    fireEvent.blur(getByRole('textbox'))

    await waitFor(() => expect(updateMutationResult).toHaveBeenCalled())
  })

  it('should update chat button icon ', async () => {
    const result = jest.fn(() => ({
      data: {
        journey: {
          chatButtons: [
            {
              __typename: 'ChatButton',
              id: 'chat1.id',
              link: 'chat 1 test link',
              platform: ChatPlatform.tikTok
            }
          ]
        }
      }
    }))

    const updateMutationResult = jest.fn(() => ({
      data: {
        chatButtonUpdate: {
          id: 'chat1.id',
          link: 'new chat 1 test link',
          platform: ChatPlatform.instagram
        }
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_JOURNEY_CHAT_BUTTONS,
              variables: {
                id: '1'
              }
            },
            result
          },
          {
            request: {
              query: JOURNEY_CHAT_BUTTON_UPDATE,
              variables: {
                chatButtonUpdateId: 'chat1.id',
                journeyId: '1',
                input: {
                  link: 'chat 1 test link',
                  platform: ChatPlatform.instagram
                }
              }
            },
            result: updateMutationResult
          }
        ]}
      >
        <Chat journeyId="1" />
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(getByRole('button', { name: 'Custom' }))
    fireEvent.mouseDown(getByRole('button', { name: 'Chat Platform' }))
    fireEvent.click(getByRole('option', { name: 'Instagram' }))

    await waitFor(() => expect(updateMutationResult).toHaveBeenCalled())
  })

  it('should remove a chat button ', async () => {
    const result = jest.fn(() => ({
      data: {
        journey: {
          chatButtons: [
            {
              __typename: 'ChatButton',
              id: 'chat1.id',
              link: 'test link',
              platform: ChatPlatform.facebook
            }
          ]
        }
      }
    }))

    const removeMutationResult = jest.fn(() => ({
      data: {
        chatButtonRemove: {
          id: 'chat1.id'
        }
      }
    }))

    const { getAllByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_JOURNEY_CHAT_BUTTONS,
              variables: {
                id: '1'
              }
            },
            result
          },
          {
            request: {
              query: JOURNEY_CHAT_BUTTON_REMOVE,
              variables: {
                chatButtonRemoveId: 'chat1.id'
              }
            },
            result: removeMutationResult
          }
        ]}
      >
        <Chat journeyId="1" />
      </MockedProvider>
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
    fireEvent.click(getAllByRole('checkbox')[0])

    await waitFor(() => expect(removeMutationResult).toHaveBeenCalled())
  })
})
