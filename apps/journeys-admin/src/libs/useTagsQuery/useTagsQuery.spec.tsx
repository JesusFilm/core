import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'

import { GET_TAGS, useTagsQuery } from './useTagsQuery'

describe('useTagsQuery', () => {
  it('should return the tags', async () => {
    const result = jest.fn(() => ({
      data: {
        tags: [
          {
            __typename: 'Tag',
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: {
              value: 'Acceptance',
              primary: true
            }
          },
          {
            __typename: 'Tag',
            id: '123e4567-e89b-12d3-a456-426614174001',
            name: {
              value: 'Addiction',
              primary: true
            }
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
