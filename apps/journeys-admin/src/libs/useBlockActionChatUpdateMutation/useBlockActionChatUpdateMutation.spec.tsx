import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'

import { BlockFields_ButtonBlock as ButtonBlock } from '../../../__generated__/BlockFields'

import { blockActionChatUpdateMock } from './useBlockActionChatUpdateMutation.mock'

import { useBlockActionChatUpdateMutation } from '.'

describe('useBlockActionChatUpdateMutation', () => {
  const block1: ButtonBlock = {
    __typename: 'ButtonBlock',
    id: 'button2.id',
    parentBlockId: 'card1.id',
    parentOrder: 0,
    eventLabel: null,
    label: 'button',
    buttonVariant: null,
    buttonColor: null,
    size: null,
    startIconId: null,
    endIconId: null,
    submitEnabled: null,
    action: null,
    settings: null
  }

  it('should update block action', async () => {
    const mockResult = jest
      .fn()
      .mockReturnValue(blockActionChatUpdateMock.result)

    const { result } = renderHook(() => useBlockActionChatUpdateMutation(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[{ ...blockActionChatUpdateMock, result: mockResult }]}
        >
          {children}
        </MockedProvider>
      )
    })

    await act(async () => {
      await result.current[0](
        block1,
        'https://chat.example.com',
        false,
        'step.id'
      )

      expect(mockResult).toHaveBeenCalled()
    })
  })

  it('should update cache', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      'ButtonBlock:button2.id': {
        ...block1
      }
    })

    const { result } = renderHook(() => useBlockActionChatUpdateMutation(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[blockActionChatUpdateMock]} cache={cache}>
          {children}
        </MockedProvider>
      )
    })

    await act(async () => {
      await result.current[0](
        block1,
        'https://chat.example.com',
        false,
        'step.id'
      )

      await waitFor(() =>
        expect(cache.extract()['ButtonBlock:button2.id']).toEqual({
          ...block1,
          action: {
            __typename: 'ChatAction',
            gtmEventName: null,
            parentBlockId: 'button2.id',
            chatUrl: 'https://chat.example.com',
            customizable: false,
            parentStepId: 'step.id'
          }
        })
      )
    })
  })
})
