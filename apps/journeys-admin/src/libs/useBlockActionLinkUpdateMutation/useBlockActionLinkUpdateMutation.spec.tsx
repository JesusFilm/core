import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { renderHook, waitFor } from '@testing-library/react'
import { act } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { BlockFields_ButtonBlock as ButtonBlock } from '../../../__generated__/BlockFields'
import { JourneyFields as Journey } from '../../../__generated__/JourneyFields'

import { blockActionLinkUpdateMock } from './useBlockActionLinkUpdateMutation.mock'

import { useBlockActionLinkUpdateMutation } from '.'

describe('useBlockActionLinkUpdateMutation', () => {
  const journey = {
    id: 'journey-id'
  } as unknown as Journey

  const block1: ButtonBlock = {
    __typename: 'ButtonBlock',
    id: 'button1.id',
    parentBlockId: 'card1.id',
    parentOrder: 0,
    label: 'button',
    buttonVariant: null,
    buttonColor: null,
    size: null,
    startIconId: null,
    endIconId: null,
    action: null
  }

  it('should update block action', async () => {
    const mockResult = jest
      .fn()
      .mockReturnValue(blockActionLinkUpdateMock.result)

    const { result } = renderHook(() => useBlockActionLinkUpdateMutation(), {
      wrapper: ({ children }) => (
        <JourneyProvider value={{ journey }}>
          <MockedProvider
            mocks={[{ ...blockActionLinkUpdateMock, result: mockResult }]}
          >
            {children}
          </MockedProvider>
        </JourneyProvider>
      )
    })

    await act(async () => {
      await result.current[0](block1, 'https://github.com')

      expect(mockResult).toHaveBeenCalled()
    })
  })

  it('should update cache', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      'ButtonBlock:button1.id': {
        ...block1
      }
    })

    const { result } = renderHook(() => useBlockActionLinkUpdateMutation(), {
      wrapper: ({ children }) => (
        <JourneyProvider value={{ journey }}>
          <MockedProvider mocks={[blockActionLinkUpdateMock]} cache={cache}>
            {children}
          </MockedProvider>
        </JourneyProvider>
      )
    })

    await act(async () => {
      await result.current[0](block1, 'https://github.com')

      await waitFor(() =>
        expect(cache.extract()['ButtonBlock:button1.id']).toEqual({
          ...block1,
          action: {
            __typename: 'LinkAction',
            gtmEventName: null,
            parentBlockId: 'button1.id',
            url: 'https://github.com'
          }
        })
      )
    })
  })
})
