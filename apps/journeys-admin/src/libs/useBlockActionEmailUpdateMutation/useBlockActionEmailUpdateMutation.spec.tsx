import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { renderHook, waitFor } from '@testing-library/react'
import { act } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { BlockFields_ButtonBlock as ButtonBlock } from '../../../__generated__/BlockFields'
import { JourneyFields as Journey } from '../../../__generated__/JourneyFields'

import { blockActionEmailUpdateMock } from './useBlockActionEmailUpdateMutation.mock'

import { useBlockActionEmailUpdateMutation } from '.'

describe('useBlockActionEmailUpdateMutation', () => {
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
      .mockReturnValue(blockActionEmailUpdateMock.result)

    const { result } = renderHook(() => useBlockActionEmailUpdateMutation(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[{ ...blockActionEmailUpdateMock, result: mockResult }]}
        >
          {children}
        </MockedProvider>
      )
    })

    await act(async () => {
      await result.current[0](block1, 'edmondwashere@gmail.com')

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

    const { result } = renderHook(() => useBlockActionEmailUpdateMutation(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[blockActionEmailUpdateMock]} cache={cache}>
          <JourneyProvider value={{ journey: {} as unknown as Journey }}>
            {children}
          </JourneyProvider>
        </MockedProvider>
      )
    })

    await act(async () => {
      await result.current[0](block1, 'edmondwashere@gmail.com')

      await waitFor(() =>
        expect(cache.extract()['ButtonBlock:button2.id']).toEqual({
          ...block1,
          action: {
            __typename: 'EmailAction',
            gtmEventName: null,
            parentBlockId: 'button2.id',
            email: 'edmondwashere@gmail.com'
          }
        })
      )
    })
  })
})
