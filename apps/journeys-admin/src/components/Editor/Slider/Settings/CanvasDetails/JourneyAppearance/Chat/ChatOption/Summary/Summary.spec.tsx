import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import noop from 'lodash/noop'
import { SnackbarProvider } from 'notistack'

import { CommandProvider } from '@core/journeys/ui/CommandProvider'

import { MessagePlatform } from '../../../../../../../../../../__generated__/globalTypes'
import { JourneyChatButtonCreate } from '../../../../../../../../../../__generated__/JourneyChatButtonCreate'
import { JourneyChatButtonRemove } from '../../../../../../../../../../__generated__/JourneyChatButtonRemove'
import { CommandUndoItem } from '../../../../../../../Toolbar/Items/CommandUndoItem'

import {
  JOURNEY_CHAT_BUTTON_CREATE,
  JOURNEY_CHAT_BUTTON_REMOVE
} from './Summary'

import { Summary } from '.'

describe('Summary', () => {
  it('should render', () => {
    const props = {
      title: 'title',
      active: true,
      disableSelection: true,
      journeyId: 'journeyId',
      currentLink: 'https://example.com',
      currentPlatform: MessagePlatform.facebook,
      chatButtonId: 'chat.id',
      openAccordion: noop
    }

    const { getByRole, getByText } = render(
      <MockedProvider>
        <SnackbarProvider>
          <Summary {...props} />
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByRole('checkbox')).toBeChecked()
    expect(getByText('title')).toBeInTheDocument()
  })

  it('should disable if not selected and not active', () => {
    const props = {
      title: 'title',
      active: false,
      disableSelection: true,
      journeyId: 'journeyId',
      currentLink: 'https://example.com',
      currentPlatform: MessagePlatform.facebook,
      chatButtonId: 'chat.id',
      openAccordion: noop
    }

    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <Summary {...props} />
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByRole('checkbox')).not.toBeChecked()
    expect(getByRole('checkbox')).toBeDisabled()
  })

  it('should disable when journeyId is missing', () => {
    const props = {
      title: 'title',
      active: false,
      disableSelection: false,
      journeyId: undefined,
      currentLink: 'https://example.com',
      currentPlatform: MessagePlatform.facebook,
      chatButtonId: 'chat.id',
      openAccordion: noop
    }

    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <Summary {...props} />
        </SnackbarProvider>
      </MockedProvider>
    )
    expect(getByRole('checkbox')).toBeDisabled()
  })

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
          id: 'chat.id',
          link: '',
          platform: MessagePlatform.facebook
        }
      }
    }))

    const props = {
      title: 'title',
      active: false,
      disableSelection: false,
      journeyId: 'journeyId',
      currentLink: '',
      currentPlatform: MessagePlatform.facebook,
      chatButtonId: 'chat.id',
      openAccordion: noop
    }

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
                  platform: MessagePlatform.facebook
                }
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <CommandProvider>
            <Summary {...props} />
          </CommandProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByRole('checkbox')).not.toBeChecked()
    fireEvent.click(getByRole('checkbox'))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(cache.extract()['Journey:journeyId']?.chatButtons).toEqual([
      { __ref: 'ChatButton:chat.id' }
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
            __ref: 'ChatButton:chat.id'
          }
        ]
      },
      'ChatButton:chat.id': {
        __typename: 'ChatButton',
        id: 'chat.id',
        link: 'https://example.com',
        platform: MessagePlatform.facebook
      }
    })

    const result = jest.fn(() => ({
      data: {
        chatButtonRemove: {
          __typename: 'ChatButton',
          id: 'chat.id'
        }
      }
    }))

    const props = {
      title: 'title',
      active: true,
      disableSelection: true,
      journeyId: 'journeyId',
      currentLink: 'https://example.com',
      currentPlatform: MessagePlatform.facebook,
      chatButtonId: 'chat.id',
      openAccordion: noop
    }

    const { getByRole } = render(
      <MockedProvider
        cache={cache}
        mocks={[
          {
            request: {
              query: JOURNEY_CHAT_BUTTON_REMOVE,
              variables: {
                chatButtonRemoveId: 'chat.id'
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <CommandProvider>
            <Summary {...props} />
          </CommandProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByRole('checkbox')).toBeChecked()
    fireEvent.click(getByRole('checkbox'))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(cache.extract()['Journey:journeyId']?.chatButtons).toEqual([])
  })

  it('undo after toggle ON removes the created chat button', async () => {
    const createResult = jest.fn(() => ({
      data: {
        chatButtonCreate: {
          __typename: 'ChatButton' as const,
          id: 'new-chat.id',
          link: '',
          platform: MessagePlatform.facebook,
          customizable: null
        }
      }
    }))

    const removeResult = jest.fn(() => ({
      data: {
        chatButtonRemove: {
          __typename: 'ChatButton' as const,
          id: 'new-chat.id'
        }
      }
    }))

    const createMock: MockedResponse<JourneyChatButtonCreate> = {
      request: {
        query: JOURNEY_CHAT_BUTTON_CREATE,
        variables: {
          journeyId: 'journeyId',
          input: { link: '', platform: MessagePlatform.facebook }
        }
      },
      result: createResult
    }

    const removeMock: MockedResponse<JourneyChatButtonRemove> = {
      request: {
        query: JOURNEY_CHAT_BUTTON_REMOVE,
        variables: { chatButtonRemoveId: 'new-chat.id' }
      },
      result: removeResult
    }

    render(
      <MockedProvider mocks={[createMock, removeMock]}>
        <SnackbarProvider>
          <CommandProvider>
            <Summary
              title="Facebook Messenger"
              active={false}
              disableSelection={false}
              journeyId="journeyId"
              currentLink=""
              currentPlatform={MessagePlatform.facebook}
            />
            <CommandUndoItem variant="button" />
          </CommandProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('checkbox'))
    await waitFor(() => expect(createResult).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(removeResult).toHaveBeenCalled())
  })

  it('undo after toggle OFF recreates the chat button', async () => {
    const removeResult = jest.fn(() => ({
      data: {
        chatButtonRemove: {
          __typename: 'ChatButton' as const,
          id: 'chat.id'
        }
      }
    }))

    const createResult = jest.fn(() => ({
      data: {
        chatButtonCreate: {
          __typename: 'ChatButton' as const,
          id: 'restored-chat.id',
          link: 'https://example.com',
          platform: MessagePlatform.whatsApp,
          customizable: null
        }
      }
    }))

    const removeMock: MockedResponse<JourneyChatButtonRemove> = {
      request: {
        query: JOURNEY_CHAT_BUTTON_REMOVE,
        variables: { chatButtonRemoveId: 'chat.id' }
      },
      result: removeResult
    }

    const createMock: MockedResponse<JourneyChatButtonCreate> = {
      request: {
        query: JOURNEY_CHAT_BUTTON_CREATE,
        variables: {
          journeyId: 'journeyId',
          input: {
            link: 'https://example.com',
            platform: MessagePlatform.whatsApp
          }
        }
      },
      result: createResult
    }

    render(
      <MockedProvider mocks={[removeMock, createMock]}>
        <SnackbarProvider>
          <CommandProvider>
            <Summary
              title="WhatsApp"
              active={true}
              disableSelection={false}
              journeyId="journeyId"
              currentLink="https://example.com"
              currentPlatform={MessagePlatform.whatsApp}
              chatButtonId="chat.id"
            />
            <CommandUndoItem variant="button" />
          </CommandProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('checkbox'))
    await waitFor(() => expect(removeResult).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(createResult).toHaveBeenCalled())
  })
})
