import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook } from '@testing-library/react'

import { useHostCreateMutation } from './useHostCreateMutation'
import { hostCreateMock } from './useHostCreateMutation.mock'

describe('useHostCreateMutation', () => {
  it('should create host', async () => {
    const mockResult = jest.fn().mockReturnValue(hostCreateMock.result)

    const { result } = renderHook(() => useHostCreateMutation(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[{ ...hostCreateMock, result: mockResult }]}>
          {children}
        </MockedProvider>
      )
    })
    await act(async () => {
      await result.current[0]({
        variables: { teamId: 'team.id', input: { title: 'value' } }
      })
      expect(mockResult).toHaveBeenCalled()
    })
  })

  it('should update the cache', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journey-id': {
        id: 'journey-id',
        __typename: 'Journey',
        blocks: []
      }
    })
    const { result } = renderHook(() => useHostCreateMutation(), {
      wrapper: ({ children }) => (
        <MockedProvider cache={cache} mocks={[hostCreateMock]}>
          {children}
        </MockedProvider>
      )
    })
    await act(async () => {
      await result.current[0]({
        variables: { teamId: 'team.id', input: { title: 'value' } }
      })
      expect(cache.extract()['Host:host.id']).toEqual({
        __typename: 'Host',
        id: 'host.id',
        title: 'value'
      })
    })
  })
})
