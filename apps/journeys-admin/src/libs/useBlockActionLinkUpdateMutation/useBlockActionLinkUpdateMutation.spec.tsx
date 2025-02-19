import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { renderHook, waitFor } from '@testing-library/react'
import { act } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { BlockFields_ButtonBlock as ButtonBlock } from '../../../__generated__/BlockFields'
import { JourneyFields as Journey } from '../../../__generated__/JourneyFields'
import { journeyUpdatedAtCacheUpdate } from '../journeyUpdatedAtCacheUpdate'

import { blockActionLinkUpdateMock } from './useBlockActionLinkUpdateMutation.mock'

import { useBlockActionLinkUpdateMutation } from '.'

jest.mock('../journeyUpdatedAtCacheUpdate', () => {
  return {
    journeyUpdatedAtCacheUpdate: jest.fn()
  }
})

describe('useBlockActionLinkUpdateMutation', () => {
  const block1: ButtonBlock = {
    __typename: 'ButtonBlock',
    id: 'button2.id',
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
        <MockedProvider
          mocks={[{ ...blockActionLinkUpdateMock, result: mockResult }]}
        >
          <JourneyProvider value={{ journey: {} as unknown as Journey }}>
            {children}
          </JourneyProvider>
        </MockedProvider>
      )
    })

    await act(async () => {
      await result.current[0](block1, 'https://github.com')

      expect(mockResult).toHaveBeenCalled()
    })

    await waitFor(() => expect(journeyUpdatedAtCacheUpdate).toHaveBeenCalled())
  })

  it('should update cache', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      'ButtonBlock:button2.id': {
        ...block1
      }
    })

    const { result } = renderHook(() => useBlockActionLinkUpdateMutation(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[blockActionLinkUpdateMock]} cache={cache}>
          <JourneyProvider value={{ journey: {} as unknown as Journey }}>
            {children}
          </JourneyProvider>
        </MockedProvider>
      )
    })

    await act(async () => {
      await result.current[0](block1, 'https://github.com')

      await waitFor(() =>
        expect(cache.extract()['ButtonBlock:button2.id']).toEqual({
          ...block1,
          action: {
            __typename: 'LinkAction',
            gtmEventName: null,
            parentBlockId: 'button2.id',
            url: 'https://github.com'
          }
        })
      )
    })

    await waitFor(() => expect(journeyUpdatedAtCacheUpdate).toHaveBeenCalled())
  })
})
