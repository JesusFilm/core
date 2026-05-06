import { MockedResponse } from '@apollo/client/testing'

import {
  TemplateGalleryPageReorderTemplate,
  TemplateGalleryPageReorderTemplateVariables,
  TemplateGalleryPageReorderTemplate_templateGalleryPageReorderTemplate as Reordered
} from '../../../__generated__/TemplateGalleryPageReorderTemplate'
import { TemplateGalleryPageStatus } from '../../../__generated__/globalTypes'

import { TEMPLATE_GALLERY_PAGE_REORDER_TEMPLATE } from './useTemplateGalleryPageReorderTemplateMutation'

const defaultReordered: Reordered = {
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

export const getTemplateGalleryPageReorderTemplateMock = (
  variables: TemplateGalleryPageReorderTemplateVariables,
  overrides: Partial<Reordered> = {}
): MockedResponse<
  TemplateGalleryPageReorderTemplate,
  TemplateGalleryPageReorderTemplateVariables
> => ({
  request: { query: TEMPLATE_GALLERY_PAGE_REORDER_TEMPLATE, variables },
  result: jest.fn(() => ({
    data: {
      templateGalleryPageReorderTemplate: { ...defaultReordered, ...overrides }
    }
  }))
})
