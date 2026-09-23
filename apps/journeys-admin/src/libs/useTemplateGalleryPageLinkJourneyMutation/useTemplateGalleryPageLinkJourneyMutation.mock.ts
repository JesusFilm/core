import { MockLink } from '@apollo/client/testing'

import { TemplateGalleryPageStatus } from '../../../__generated__/globalTypes'
import {
  TemplateGalleryPageLinkJourney_templateGalleryPageLinkJourney as Linked,
  TemplateGalleryPageLinkJourney,
  TemplateGalleryPageLinkJourneyVariables
} from '../../../__generated__/TemplateGalleryPageLinkJourney'

import { TEMPLATE_GALLERY_PAGE_LINK_JOURNEY } from './useTemplateGalleryPageLinkJourneyMutation'

const defaultLinked: Linked = {
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

export const getTemplateGalleryPageLinkJourneyMock = (
  variables: TemplateGalleryPageLinkJourneyVariables,
  overrides: Partial<Linked> = {}
): MockLink.MockedResponse<
  TemplateGalleryPageLinkJourney,
  TemplateGalleryPageLinkJourneyVariables
> => ({
  request: { query: TEMPLATE_GALLERY_PAGE_LINK_JOURNEY, variables },
  result: vi.fn(() => ({
    data: {
      templateGalleryPageLinkJourney: { ...defaultLinked, ...overrides }
    }
  }))
})
