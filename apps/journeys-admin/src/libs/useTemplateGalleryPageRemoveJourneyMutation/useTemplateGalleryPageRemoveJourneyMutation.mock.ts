import { MockLink } from '@apollo/client/testing'

import { TemplateGalleryPageStatus } from '../../../__generated__/globalTypes'
import {
  TemplateGalleryPageRemoveJourney_templateGalleryPageRemoveJourney as Removed,
  TemplateGalleryPageRemoveJourney,
  TemplateGalleryPageRemoveJourneyVariables
} from '../../../__generated__/TemplateGalleryPageRemoveJourney'

import { TEMPLATE_GALLERY_PAGE_REMOVE_JOURNEY } from './useTemplateGalleryPageRemoveJourneyMutation'

export const defaultRemovedPage: Removed = {
  __typename: 'TemplateGalleryPage',
  id: 'page-1',
  title: 'Collection',
  description: '',
  slug: 'collection',
  status: TemplateGalleryPageStatus.draft,
  creatorName: 'Creator',
  creatorImageSrc: null,
  creatorImageAlt: null,
  media: null,
  publishedAt: null,
  createdAt: '2026-05-06T00:00:00Z',
  updatedAt: '2026-05-06T00:00:00Z',
  templates: [],
  memberships: []
}

/**
 * `pages` is the list the server returns — every page the removal changed
 * (the page removed from, plus a promoted page when one exists). Each
 * entry is merged over `defaultRemovedPage`.
 */
export const getTemplateGalleryPageRemoveJourneyMock = (
  variables: TemplateGalleryPageRemoveJourneyVariables,
  pages: Array<Partial<Removed> & { id: string }> = variables.pageId != null
    ? [{ id: variables.pageId }]
    : []
): MockLink.MockedResponse<
  TemplateGalleryPageRemoveJourney,
  TemplateGalleryPageRemoveJourneyVariables
> => ({
  request: { query: TEMPLATE_GALLERY_PAGE_REMOVE_JOURNEY, variables },
  result: vi.fn(() => ({
    data: {
      templateGalleryPageRemoveJourney: pages.map((page) => ({
        ...defaultRemovedPage,
        ...page
      }))
    }
  }))
})
