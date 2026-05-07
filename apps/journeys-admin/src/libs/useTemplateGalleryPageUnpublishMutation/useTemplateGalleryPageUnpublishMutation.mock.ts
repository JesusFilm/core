import { MockedResponse } from '@apollo/client/testing'

import { TemplateGalleryPageStatus } from '../../../__generated__/globalTypes'
import {
  TemplateGalleryPageUnpublish,
  TemplateGalleryPageUnpublishVariables
} from '../../../__generated__/TemplateGalleryPageUnpublish'

import { TEMPLATE_GALLERY_PAGE_UNPUBLISH } from './useTemplateGalleryPageUnpublishMutation'

export const getTemplateGalleryPageUnpublishMock = (
  variables: TemplateGalleryPageUnpublishVariables
): MockedResponse<TemplateGalleryPageUnpublish, TemplateGalleryPageUnpublishVariables> => ({
  request: { query: TEMPLATE_GALLERY_PAGE_UNPUBLISH, variables },
  result: jest.fn(() => ({
    data: {
      templateGalleryPageUnpublish: {
        __typename: 'TemplateGalleryPage',
        id: variables.id,
        status: TemplateGalleryPageStatus.draft,
        publishedAt: null,
        updatedAt: '2026-05-06T00:00:00Z'
      }
    }
  }))
})
