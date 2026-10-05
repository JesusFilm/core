import { MockLink } from '@apollo/client/testing'

import { TemplateGalleryPageStatus } from '../../../__generated__/globalTypes'
import {
  TemplateGalleryPageMoveJourney_templateGalleryPageMoveJourney as Moved,
  TemplateGalleryPageMoveJourney,
  TemplateGalleryPageMoveJourneyVariables
} from '../../../__generated__/TemplateGalleryPageMoveJourney'

import { TEMPLATE_GALLERY_PAGE_MOVE_JOURNEY } from './useTemplateGalleryPageMoveJourneyMutation'

export const defaultMovedPage: Moved = {
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
 * `pages` is the list the server returns — every page the move changed.
 * Each entry is merged over `defaultMovedPage`, so a bare `{ id }` is
 * enough for tests that only care about ids.
 */
export const getTemplateGalleryPageMoveJourneyMock = (
  variables: TemplateGalleryPageMoveJourneyVariables,
  pages: Array<Partial<Moved> & { id: string }> = [
    { id: variables.fromPageId },
    { id: variables.toPageId }
  ]
): MockLink.MockedResponse<
  TemplateGalleryPageMoveJourney,
  TemplateGalleryPageMoveJourneyVariables
> => ({
  request: { query: TEMPLATE_GALLERY_PAGE_MOVE_JOURNEY, variables },
  result: vi.fn(() => ({
    data: {
      templateGalleryPageMoveJourney: pages.map((page) => ({
        ...defaultMovedPage,
        ...page
      }))
    }
  }))
})
