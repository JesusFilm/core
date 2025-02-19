import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { renderHook, waitFor } from '@testing-library/react'
import { act } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { BlockFields_ButtonBlock as ButtonBlock } from '../../../__generated__/BlockFields'
import { JourneyFields as Journey } from '../../../__generated__/JourneyFields'
import { journeyUpdatedAtCacheUpdate } from '../journeyUpdatedAtCacheUpdate'

import { blockActionNavigateToBlockUpdateMock } from './useBlockActionNavigateToBlockUpdateMutation.mock'

import { useBlockActionNavigateToBlockUpdateMutation } from '.'

jest.mock('../journeyUpdatedAtCacheUpdate', () => {
  return {
    journeyUpdatedAtCacheUpdate: jest.fn()
  }
})

describe('useBlockActionNavigateToBlockUpdateMutation', () => {
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
      .mockReturnValue(blockActionNavigateToBlockUpdateMock.result)

    const { result } = renderHook(
      () => useBlockActionNavigateToBlockUpdateMutation(),
      {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[
              { ...blockActionNavigateToBlockUpdateMock, result: mockResult }
            ]}
          >
            <JourneyProvider value={{ journey: {} as unknown as Journey }}>
              {children}
            </JourneyProvider>
          </MockedProvider>
        )
      }
    )

    await act(async () => {
      await result.current[0](block1, 'step2.id')

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

    const { result } = renderHook(
      () => useBlockActionNavigateToBlockUpdateMutation(),
      {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[blockActionNavigateToBlockUpdateMock]}
            cache={cache}
          >
            <JourneyProvider value={{ journey: {} as unknown as Journey }}>
              {children}
            </JourneyProvider>
          </MockedProvider>
        )
      }
    )

    await act(async () => {
      await result.current[0](block1, 'step2.id')

      await waitFor(() =>
        expect(cache.extract()['ButtonBlock:button2.id']).toEqual({
          ...block1,
          action: {
            __typename: 'NavigateToBlockAction',
            gtmEventName: null,
            parentBlockId: 'button2.id',
            blockId: 'step2.id'
          }
        })
      )
    })

    await waitFor(() => expect(journeyUpdatedAtCacheUpdate).toHaveBeenCalled())
  })
})
