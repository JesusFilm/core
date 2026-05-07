import { MockedResponse } from '@apollo/client/testing'

import { TemplateGalleryPageStatus } from '../../../__generated__/globalTypes'
import {
  TemplateGalleryPagePublish,
  TemplateGalleryPagePublishVariables
} from '../../../__generated__/TemplateGalleryPagePublish'

import { TEMPLATE_GALLERY_PAGE_PUBLISH } from './useTemplateGalleryPagePublishMutation'

export const getTemplateGalleryPagePublishMock = (
  variables: TemplateGalleryPagePublishVariables
): MockedResponse<TemplateGalleryPagePublish, TemplateGalleryPagePublishVariables> => ({
  request: { query: TEMPLATE_GALLERY_PAGE_PUBLISH, variables },
  result: jest.fn(() => ({
    data: {
      templateGalleryPagePublish: {
        __typename: 'TemplateGalleryPage',
        id: variables.id,
        status: TemplateGalleryPageStatus.published,
        publishedAt: '2026-05-06T00:00:00Z',
        updatedAt: '2026-05-06T00:00:00Z',
        slug: 'collection'
      }
    }
  }))
})
