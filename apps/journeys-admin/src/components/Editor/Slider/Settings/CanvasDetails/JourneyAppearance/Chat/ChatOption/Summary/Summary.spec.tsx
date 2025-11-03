import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import noop from 'lodash/noop'
import { SnackbarProvider } from 'notistack'

import { MessagePlatform } from '../../../../../../../../../../__generated__/globalTypes'

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
          <Summary {...props} />
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
          <Summary {...props} />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByRole('checkbox')).toBeChecked()
    fireEvent.click(getByRole('checkbox'))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(cache.extract()['Journey:journeyId']?.chatButtons).toEqual([])
  })
})
