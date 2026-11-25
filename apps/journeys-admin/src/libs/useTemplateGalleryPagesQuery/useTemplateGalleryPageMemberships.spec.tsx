import { InMemoryCache } from '@apollo/client'
import { MockLink } from '@apollo/client/testing'
import { MockedProvider } from '@apollo/client/testing/react'
import { act, renderHook } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'

import { GetTemplateGalleryPages_templateGalleryPages as TemplateGalleryPage } from '../../../__generated__/GetTemplateGalleryPages'
import { TemplateGalleryPageStatus } from '../../../__generated__/globalTypes'
import {
  TEMPLATE_GALLERY_PAGE_DELETE,
  useTemplateGalleryPageDeleteMutation
} from '../useTemplateGalleryPageDeleteMutation/useTemplateGalleryPageDeleteMutation'
import {
  TEMPLATE_GALLERY_PAGE_UPDATE,
  useTemplateGalleryPageUpdateMutation
} from '../useTemplateGalleryPageUpdateMutation/useTemplateGalleryPageUpdateMutation'

import {
  GET_TEMPLATE_GALLERY_PAGES,
  useTemplateGalleryPagesQuery
} from './useTemplateGalleryPagesQuery'

function buildPage(id: string, isHome: boolean): TemplateGalleryPage {
  return {
    __typename: 'TemplateGalleryPage',
    id,
    title: id,
    description: '',
    slug: id,
    status: TemplateGalleryPageStatus.draft,
    creatorName: '',
    creatorImageSrc: null,
    creatorImageAlt: null,
    media: null,
    publishedAt: null,
    createdAt: '2026-05-01T00:00:00Z',
    updatedAt: '2026-05-01T00:00:00Z',
    templates: [
      {
        __typename: 'TemplateGalleryItem',
        id: 'journey-1',
        title: 'Welcome',
        primaryImageBlock: null
      }
    ],
    memberships: [
      {
        __typename: 'TemplateGalleryPageMembership',
        journeyId: 'journey-1',
        isHome
      }
    ]
  }
}

describe('collection membership cache', () => {
  it.each(['save', 'ungroup'] as const)(
    'refreshes the promoted home after %s without reloading',
    async (action) => {
      const cache = new InMemoryCache()
      const home = buildPage('page-A', true)
      const link = buildPage('page-B', false)
      const emptiedHome = { ...home, templates: [], memberships: [] }
      const promotedHome = buildPage('page-B', true)
      cache.writeQuery({
        query: GET_TEMPLATE_GALLERY_PAGES,
        variables: { teamId: 'team-1' },
        data: { templateGalleryPages: [home, link] }
      })
      const mutationMock: MockLink.MockedResponse =
        action === 'save'
          ? {
              request: {
                query: TEMPLATE_GALLERY_PAGE_UPDATE,
                variables: { id: 'page-A', input: { journeyIds: [] } }
              },
              result: { data: { templateGalleryPageUpdate: emptiedHome } }
            }
          : {
              request: {
                query: TEMPLATE_GALLERY_PAGE_DELETE,
                variables: { id: 'page-A' }
              },
              result: {
                data: {
                  templateGalleryPageDelete: {
                    __typename: 'TemplateGalleryPage',
                    id: 'page-A'
                  }
                }
              }
            }
      const refetchMock: MockLink.MockedResponse = {
        request: {
          query: GET_TEMPLATE_GALLERY_PAGES,
          variables: { teamId: 'team-1' }
        },
        result: {
          data: {
            templateGalleryPages:
              action === 'save' ? [emptiedHome, promotedHome] : [promotedHome]
          }
        }
      }
      function Wrapper({ children }: { children: ReactNode }): ReactElement {
        return (
          <MockedProvider cache={cache} mocks={[mutationMock, refetchMock]}>
            {children}
          </MockedProvider>
        )
      }
      const { result } = renderHook(
        () => ({
          pages: useTemplateGalleryPagesQuery({ teamId: 'team-1' }),
          save: useTemplateGalleryPageUpdateMutation()[0],
          ungroup: useTemplateGalleryPageDeleteMutation()[0]
        }),
        { wrapper: Wrapper }
      )
      expect(
        result.current.pages.data?.templateGalleryPages[1].memberships[0].isHome
      ).toBe(false)
      await act(async () => {
        if (action === 'save')
          await result.current.save({
            variables: { id: 'page-A', input: { journeyIds: [] } }
          })
        else await result.current.ungroup({ variables: { id: 'page-A' } })
      })
      expect(
        result.current.pages.data?.templateGalleryPages.find(
          (page) => page.id === 'page-B'
        )?.memberships[0].isHome
      ).toBe(true)
    }
  )
})
