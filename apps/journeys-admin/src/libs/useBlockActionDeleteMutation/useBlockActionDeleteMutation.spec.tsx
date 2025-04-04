import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { BlockFields_ButtonBlock as ButtonBlock } from '../../../__generated__/BlockFields'
import { JourneyFields as Journey } from '../../../__generated__/JourneyFields'

import { blockActionDeleteMock } from './useBlockActionDeleteMutation.mock'

import { useBlockActionDeleteMutation } from '.'

describe('useBlockActionDeleteMutation', () => {
  const journey = {
    id: 'journey-id'
  } as unknown as Journey

  const block1: ButtonBlock = {
    __typename: 'ButtonBlock',
    id: 'block1.id',
    parentBlockId: 'card1.id',
    parentOrder: 0,
    label: 'button',
    buttonVariant: null,
    buttonColor: null,
    size: null,
    startIconId: null,
    endIconId: null,
    submitEnabled: null,
    action: {
      __typename: 'NavigateToBlockAction',
      gtmEventName: null,
      parentBlockId: 'step1.id',
      blockId: 'step2.id'
    }
  }

  it('should delete block action', async () => {
    const mockResult = jest.fn().mockReturnValue(blockActionDeleteMock.result)

    const { result } = renderHook(() => useBlockActionDeleteMutation(), {
      wrapper: ({ children }) => (
        <JourneyProvider value={{ journey }}>
          <MockedProvider
            mocks={[{ ...blockActionDeleteMock, result: mockResult }]}
          >
            {children}
          </MockedProvider>
        </JourneyProvider>
      )
    })

    await act(async () => {
      await result.current[0](block1)

      expect(mockResult).toHaveBeenCalled()
    })
  })

  it('should update cache', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      'ButtonBlock:block1.id': {
        ...block1
      }
    })

    const { result } = renderHook(() => useBlockActionDeleteMutation(), {
      wrapper: ({ children }) => (
        <JourneyProvider value={{ journey }}>
          <MockedProvider mocks={[blockActionDeleteMock]} cache={cache}>
            {children}
          </MockedProvider>
        </JourneyProvider>
      )
    })

    await act(async () => {
      await result.current[0](block1)

      await waitFor(() =>
        expect(cache.extract()['ButtonBlock:block1.id']).toEqual({
          ...block1,
          action: null
        })
      )
    })
  })
})
