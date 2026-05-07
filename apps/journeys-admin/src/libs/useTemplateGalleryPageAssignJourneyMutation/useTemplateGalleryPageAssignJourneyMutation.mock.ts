import { MockedResponse } from '@apollo/client/testing'

import { TemplateGalleryPageStatus } from '../../../__generated__/globalTypes'
import {
  TemplateGalleryPageAssignJourney_templateGalleryPageAssignJourney as Assigned,
  TemplateGalleryPageAssignJourney,
  TemplateGalleryPageAssignJourneyVariables
} from '../../../__generated__/TemplateGalleryPageAssignJourney'

import { TEMPLATE_GALLERY_PAGE_ASSIGN_JOURNEY } from './useTemplateGalleryPageAssignJourneyMutation'

const defaultAssigned: Assigned = {
  __typename: 'TemplateGalleryPage',
  id: 'page-1',
  title: 'Collection',
  description: '',
  slug: 'collection',
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

export const getTemplateGalleryPageAssignJourneyMock = (
  variables: TemplateGalleryPageAssignJourneyVariables,
  overrides: Partial<Assigned> = {}
): MockedResponse<
  TemplateGalleryPageAssignJourney,
  TemplateGalleryPageAssignJourneyVariables
> => ({
  request: { query: TEMPLATE_GALLERY_PAGE_ASSIGN_JOURNEY, variables },
  result: jest.fn(() => ({
    data: {
      templateGalleryPageAssignJourney: { ...defaultAssigned, ...overrides }
    }
  }))
})
