import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'

import { Service } from '../../../__generated__/globalTypes'

import { GET_TAGS, useTagsQuery } from './useTagsQuery'

describe('useTagsQuery', () => {
  it('should return the tags', async () => {
    const result = jest.fn(() => ({
      data: {
        tags: [
          {
            __typename: 'Tag',
            id: '73cb38e3-06b6-4f34-b1e1-8d2859e510a1',
            service: Service.apiJourneys,
            parentId: '73cb38e3-06b6-4f34-b1e1-8d2859e521b2',
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
            service: Service.apiVideos,
            parentId: '29ceed4c-c2e7-4b0e-8643-74181b647895',
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

    renderHook(() => useTagsQuery(), {
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
  })
})
