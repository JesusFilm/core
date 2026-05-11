import { MockedResponse } from '@apollo/client/testing'

import { TemplateGalleryPageStatus } from '../../../__generated__/globalTypes'
import {
  TemplateGalleryPageCreate_templateGalleryPageCreate as Created,
  TemplateGalleryPageCreate,
  TemplateGalleryPageCreateVariables
} from '../../../__generated__/TemplateGalleryPageCreate'

import { TEMPLATE_GALLERY_PAGE_CREATE } from './useTemplateGalleryPageCreateMutation'

const defaultCreated: Created = {
  __typename: 'TemplateGalleryPage',
  id: 'page-1',
  title: 'My Collection',
  description: '',
  slug: 'my-collection',
  status: TemplateGalleryPageStatus.draft,
  creatorName: 'Creator',
  creatorImageSrc: null,
  creatorImageAlt: null,
  mediaUrl: null,
  publishedAt: null,
  createdAt: '2026-05-06T00:00:00Z',
  updatedAt: '2026-05-06T00:00:00Z',
  team: { __typename: 'Team', id: 'team-1' },
  templates: []
}

export const getTemplateGalleryPageCreateMock = (
  variables: TemplateGalleryPageCreateVariables,
  overrides: Partial<Created> = {}
): MockedResponse<
  TemplateGalleryPageCreate,
  TemplateGalleryPageCreateVariables
> => ({
  request: { query: TEMPLATE_GALLERY_PAGE_CREATE, variables },
  result: jest.fn(() => ({
    data: {
      templateGalleryPageCreate: { ...defaultCreated, ...overrides }
    }
  }))
})
