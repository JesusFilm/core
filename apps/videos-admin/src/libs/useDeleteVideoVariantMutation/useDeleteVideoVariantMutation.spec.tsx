import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { renderHook } from '@testing-library/react'
import { act } from 'react'

import {
  DELETE_VIDEO_VARIANT,
  useDeleteVideoVariantMutation
} from './useDeleteVideoVariantMutation'

const mockVideoVariant = {
  __typename: 'VideoVariant',
  id: 'variant-1',
  videoId: 'video-1',
  slug: 'variant-slug',
  language: {
    __typename: 'Language',
    id: 'lang-1',
    name: [
      {
        __typename: 'LanguageName',
        value: 'English',
        primary: true
      }
    ]
  }
}

const mockVideo = {
  __typename: 'Video',
  id: 'video-1',
  variants: [mockVideoVariant]
}

const deleteVariantMock = {
  request: {
    query: DELETE_VIDEO_VARIANT,
    variables: { id: 'variant-1' }
  },
  result: {
    data: {
      videoVariantDelete: mockVideoVariant
    }
  }
}

describe('useDeleteVideoVariantMutation', () => {
  it('should delete a variant and update the cache', async () => {
    const deleteVariantMockResult = jest
      .fn()
      .mockReturnValue({ ...deleteVariantMock.result })

    const cache = new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            adminVideo: {
              read(_, { variables }) {
                return mockVideo
              }
            }
          }
        }
      }
    })
    const evictSpy = jest.spyOn(cache, 'evict')

    const { result } = renderHook(() => useDeleteVideoVariantMutation(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[{ ...deleteVariantMock, result: deleteVariantMockResult }]}
          cache={cache}
        >
          {children}
        </MockedProvider>
      )
    })

    const [deleteVariant] = result.current

    await act(async () => {
      await deleteVariant({
        variables: { id: 'variant-1' }
      })
    })
    expect(evictSpy).toHaveBeenCalledWith({
      id: cache.identify({
        __typename: 'VideoVariant',
        id: 'variant-1'
      })
    })
    expect(deleteVariantMockResult).toHaveBeenCalled()
  })
})
