import { MockedResponse } from '@apollo/client/testing'

import { TemplateGalleryPageStatus } from '../../../__generated__/globalTypes'
import {
  TemplateGalleryPageUpdate,
  TemplateGalleryPageUpdateVariables,
  TemplateGalleryPageUpdate_templateGalleryPageUpdate as Updated
} from '../../../__generated__/TemplateGalleryPageUpdate'

import { TEMPLATE_GALLERY_PAGE_UPDATE } from './useTemplateGalleryPageUpdateMutation'

const defaultUpdated: Updated = {
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
  templates: []
}

export const getTemplateGalleryPageUpdateMock = (
  variables: TemplateGalleryPageUpdateVariables,
  overrides: Partial<Updated> = {}
): MockedResponse<TemplateGalleryPageUpdate, TemplateGalleryPageUpdateVariables> => ({
  request: { query: TEMPLATE_GALLERY_PAGE_UPDATE, variables },
  result: jest.fn(() => ({
    data: {
      templateGalleryPageUpdate: { ...defaultUpdated, ...overrides }
    }
  }))
})
