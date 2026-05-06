import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'

import { TemplateGalleryPageStatus } from '../../../__generated__/globalTypes'
import { GET_TEMPLATE_GALLERY_PAGES } from '../useTemplateGalleryPagesQuery'

import { useTemplateGalleryPageDeleteMutation } from './useTemplateGalleryPageDeleteMutation'
import { getTemplateGalleryPageDeleteMock } from './useTemplateGalleryPageDeleteMutation.mock'

function buildPage(id: string): {
  __typename: 'TemplateGalleryPage'
  id: string
  title: string
  description: string
  slug: string
  status: TemplateGalleryPageStatus
  creatorName: string
  creatorImageSrc: null
  creatorImageAlt: null
  mediaUrl: null
  publishedAt: null
  createdAt: string
  updatedAt: string
  templates: never[]
} {
  return {
    __typename: 'TemplateGalleryPage' as const,
    id,
    title: id,
    description: '',
    slug: id,
    status: TemplateGalleryPageStatus.draft,
    creatorName: 'Creator',
    creatorImageSrc: null,
    creatorImageAlt: null,
    mediaUrl: null,
    publishedAt: null,
    createdAt: '2026-05-06T00:00:00Z',
    updatedAt: '2026-05-06T00:00:00Z',
    templates: []
  }
}

describe('useTemplateGalleryPageDeleteMutation', () => {
  function buildWrapper(
    cache: InMemoryCache,
    deletedId: string
  ): ({ children }: { children: ReactNode }) => JSX.Element {
    const mock = getTemplateGalleryPageDeleteMock({ id: deletedId })
    return function Wrapper({ children }) {
      return (
        <MockedProvider cache={cache} mocks={[mock]}>
          <>{children}</>
        </MockedProvider>
      )
    }
  }

  it('removes the deleted page from every cached templateGalleryPages list', async () => {
    const cache = new InMemoryCache()
    cache.writeQuery({
      query: GET_TEMPLATE_GALLERY_PAGES,
      variables: { teamId: 'team-1' },
      data: {
        templateGalleryPages: [buildPage('page-1'), buildPage('page-2')]
      }
    })
    cache.writeQuery({
      query: GET_TEMPLATE_GALLERY_PAGES,
      variables: { teamId: 'team-2' },
      data: {
        templateGalleryPages: [buildPage('page-1'), buildPage('page-3')]
      }
    })

    const { result } = renderHook(() => useTemplateGalleryPageDeleteMutation(), {
      wrapper: buildWrapper(cache, 'page-1')
    })

    await act(async () => {
      await result.current[0]({ variables: { id: 'page-1' } })
    })

    await waitFor(() => {
      expect(
        cache
          .readQuery<{ templateGalleryPages: Array<{ id: string }> }>({
            query: GET_TEMPLATE_GALLERY_PAGES,
            variables: { teamId: 'team-1' }
          })
          ?.templateGalleryPages.map((p) => p.id)
      ).toEqual(['page-2'])
    })
    expect(
      cache
        .readQuery<{ templateGalleryPages: Array<{ id: string }> }>({
          query: GET_TEMPLATE_GALLERY_PAGES,
          variables: { teamId: 'team-2' }
        })
        ?.templateGalleryPages.map((p) => p.id)
    ).toEqual(['page-3'])
  })

  it('evicts the deleted entity from the normalized cache', async () => {
    const cache = new InMemoryCache()
    cache.writeQuery({
      query: GET_TEMPLATE_GALLERY_PAGES,
      variables: { teamId: 'team-1' },
      data: {
        templateGalleryPages: [buildPage('page-1'), buildPage('page-2')]
      }
    })

    const entityId = cache.identify({
      __typename: 'TemplateGalleryPage',
      id: 'page-1'
    })
    expect(entityId).toBeTruthy()
    expect(cache.extract()[entityId as string]).toBeDefined()

    const { result } = renderHook(() => useTemplateGalleryPageDeleteMutation(), {
      wrapper: buildWrapper(cache, 'page-1')
    })

    await act(async () => {
      await result.current[0]({ variables: { id: 'page-1' } })
    })

    await waitFor(() => {
      // gc() runs after evict; the entity should no longer be in the
      // normalized store.
      expect(cache.extract()[entityId as string]).toBeUndefined()
    })
  })
})
