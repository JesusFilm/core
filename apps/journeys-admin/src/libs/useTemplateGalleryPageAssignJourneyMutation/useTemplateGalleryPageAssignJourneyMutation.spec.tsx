import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'

import { TemplateGalleryPageStatus } from '../../../__generated__/globalTypes'
import { GET_TEMPLATE_GALLERY_PAGES } from '../useTemplateGalleryPagesQuery'

import { useTemplateGalleryPageAssignJourneyMutation } from './useTemplateGalleryPageAssignJourneyMutation'
import { getTemplateGalleryPageAssignJourneyMock } from './useTemplateGalleryPageAssignJourneyMutation.mock'

describe('useTemplateGalleryPageAssignJourneyMutation', () => {
  it('does not refetch GetTemplateGalleryPages after the mutation', async () => {
    // The mutation hook used to declare
    //   refetchQueries: ['GetTemplateGalleryPages']
    // which raced with the call site's optimisticResponse + cache.modify
    // (NES-1539 review todo 021). MockedProvider has only the assign
    // mock — if the hook ever reinstates a refetch this test will fail
    // with "no more mocked responses for the query".
    const cache = new InMemoryCache()
    cache.writeQuery({
      query: GET_TEMPLATE_GALLERY_PAGES,
      variables: { teamId: 'team-1' },
      data: {
        templateGalleryPages: [
          {
            __typename: 'TemplateGalleryPage',
            // Different id from the mutation target so Apollo's entity-by-id
            // merge doesn't overwrite this row — any change here would have
            // to come from a refetch.
            id: 'page-untouched',
            title: 'Untouched',
            description: '',
            slug: 'untouched',
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

    const mock = getTemplateGalleryPageAssignJourneyMock({
      journeyId: 'journey-1',
      pageId: 'page-1'
    })

    const wrapper = function Wrapper({
      children
    }: {
      children: ReactNode
    }): JSX.Element {
      return (
        <MockedProvider cache={cache} mocks={[mock]}>
          <>{children}</>
        </MockedProvider>
      )
    }

    const { result } = renderHook(
      () => useTemplateGalleryPageAssignJourneyMutation(),
      { wrapper }
    )

    await act(async () => {
      await result.current[0]({
        variables: { journeyId: 'journey-1', pageId: 'page-1' }
      })
    })

    // The mutation mock was called exactly once.
    await waitFor(() => {
      expect(mock.result).toHaveBeenCalledTimes(1)
    })
    // The cached gallery list is untouched (no refetch wrote a new
    // value into it).
    const cached = cache.readQuery<{
      templateGalleryPages: Array<{ id: string; title: string }>
    }>({
      query: GET_TEMPLATE_GALLERY_PAGES,
      variables: { teamId: 'team-1' }
    })
    expect(cached?.templateGalleryPages).toHaveLength(1)
    expect(cached?.templateGalleryPages[0].title).toBe('Untouched')
  })
})
