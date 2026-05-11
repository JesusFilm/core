import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'

import { TemplateGalleryPageStatus } from '../../../__generated__/globalTypes'
import { GET_TEMPLATE_GALLERY_PAGES } from '../useTemplateGalleryPagesQuery'

import { useTemplateGalleryPageCreateMutation } from './useTemplateGalleryPageCreateMutation'
import { getTemplateGalleryPageCreateMock } from './useTemplateGalleryPageCreateMutation.mock'

describe('useTemplateGalleryPageCreateMutation', () => {
  function buildWrapper(
    cache: InMemoryCache
  ): (children: { children: ReactNode }) => JSX.Element {
    const mock = getTemplateGalleryPageCreateMock(
      {
        input: {
          teamId: 'team-1',
          title: 'My Collection',
          creatorName: 'Creator',
          journeyIds: []
        }
      },
      { id: 'page-2', title: 'My Collection' }
    )
    return function Wrapper({ children }) {
      return (
        <MockedProvider cache={cache} mocks={[mock]}>
          <>{children}</>
        </MockedProvider>
      )
    }
  }

  it('prepends the new page into the matching team-scoped cached list', async () => {
    const cache = new InMemoryCache()
    cache.writeQuery({
      query: GET_TEMPLATE_GALLERY_PAGES,
      variables: { teamId: 'team-1' },
      data: {
        templateGalleryPages: [
          {
            __typename: 'TemplateGalleryPage',
            id: 'page-1',
            title: 'Existing',
            description: '',
            slug: 'existing',
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
        ]
      }
    })

    const { result } = renderHook(
      () => useTemplateGalleryPageCreateMutation(),
      {
        wrapper: buildWrapper(cache)
      }
    )

    await act(async () => {
      await result.current[0]({
        variables: {
          input: {
            teamId: 'team-1',
            title: 'My Collection',
            creatorName: 'Creator',
            journeyIds: []
          }
        }
      })
    })

    await waitFor(() => {
      const cached = cache.readQuery<{
        templateGalleryPages: Array<{ id: string }>
      }>({
        query: GET_TEMPLATE_GALLERY_PAGES,
        variables: { teamId: 'team-1' }
      })
      expect(cached?.templateGalleryPages.map((p) => p.id)).toEqual([
        'page-2',
        'page-1'
      ])
    })
  })

  it('does not touch a different team-scoped cached list', async () => {
    const cache = new InMemoryCache()
    cache.writeQuery({
      query: GET_TEMPLATE_GALLERY_PAGES,
      variables: { teamId: 'team-other' },
      data: {
        templateGalleryPages: [
          {
            __typename: 'TemplateGalleryPage',
            id: 'other-1',
            title: 'Other team',
            description: '',
            slug: 'other-1',
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
        ]
      }
    })

    const { result } = renderHook(
      () => useTemplateGalleryPageCreateMutation(),
      {
        wrapper: buildWrapper(cache)
      }
    )

    await act(async () => {
      await result.current[0]({
        variables: {
          input: {
            teamId: 'team-1',
            title: 'My Collection',
            creatorName: 'Creator',
            journeyIds: []
          }
        }
      })
    })

    await waitFor(() => {
      const cached = cache.readQuery<{
        templateGalleryPages: Array<{ id: string }>
      }>({
        query: GET_TEMPLATE_GALLERY_PAGES,
        variables: { teamId: 'team-other' }
      })
      expect(cached?.templateGalleryPages.map((p) => p.id)).toEqual(['other-1'])
    })
  })

  it('no-ops when no cached list exists for this team yet', async () => {
    const cache = new InMemoryCache()
    const { result } = renderHook(
      () => useTemplateGalleryPageCreateMutation(),
      {
        wrapper: buildWrapper(cache)
      }
    )

    await act(async () => {
      await result.current[0]({
        variables: {
          input: {
            teamId: 'team-1',
            title: 'My Collection',
            creatorName: 'Creator',
            journeyIds: []
          }
        }
      })
    })

    // Cache write was a no-op (nothing was cached); reading the query
    // returns null, no error.
    expect(
      cache.readQuery({
        query: GET_TEMPLATE_GALLERY_PAGES,
        variables: { teamId: 'team-1' }
      })
    ).toBeNull()
  })
})
