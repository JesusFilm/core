import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'

import { Service } from '../../../__generated__/globalTypes'

import { GET_TAGS, useTagsQuery } from './useTagsQuery'

describe('useTagsQuery', () => {
  it('should return the parent and child tags', async () => {
    const result = jest.fn(() => ({
      data: {
        tags: [
          {
            __typename: 'Tag',
            id: '73cb38e3-06b6-4f34-b1e1-8d2859e510a1',
            service: Service.apiJourneys,
            parentId: null, // This is a parent tag
            name: [
              {
                value: 'Acceptance',
                primary: true
              }
            ]
          },
          {
            __typename: 'Tag',
            id: '29ceed4c-c2e7-4b0e-8643-74181b646784',
            service: Service.apiJourneys,
            parentId: '73cb38e3-06b6-4f34-b1e1-8d2859e510a1', // This is a child tag
            name: [
              {
                value: 'Addiction',
                primary: true
              }
            ]
          }
        ]
      }
    }))

    const { result: hookResult } = renderHook(() => useTagsQuery(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[
            {
              request: {
                query: GET_TAGS
              },
              result
            }
          ]}
        >
          {children}
        </MockedProvider>
      )
    })

    await act(
      async () => await waitFor(() => expect(result).toHaveBeenCalled())
    )

    // Check that the parentTags array contains the parent tag
    expect(hookResult.current.parentTags).toEqual([
      {
        __typename: 'Tag',
        id: '73cb38e3-06b6-4f34-b1e1-8d2859e510a1',
        service: Service.apiJourneys,
        parentId: null,
        name: [
          {
            value: 'Acceptance',
            primary: true
          }
        ]
      }
    ])

    // Check that the childTags array contains the child tag
    expect(hookResult.current.childTags).toEqual([
      {
        __typename: 'Tag',
        id: '29ceed4c-c2e7-4b0e-8643-74181b646784',
        service: Service.apiJourneys,
        parentId: '73cb38e3-06b6-4f34-b1e1-8d2859e510a1',
        name: [
          {
            value: 'Addiction',
            primary: true
          }
        ]
      }
    ])
  })
})
