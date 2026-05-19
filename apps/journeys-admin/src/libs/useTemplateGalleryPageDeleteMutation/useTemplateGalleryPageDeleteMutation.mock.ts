import { MockedResponse } from '@apollo/client/testing'

import {
  TemplateGalleryPageDelete,
  TemplateGalleryPageDeleteVariables
} from '../../../__generated__/TemplateGalleryPageDelete'

import { TEMPLATE_GALLERY_PAGE_DELETE } from './useTemplateGalleryPageDeleteMutation'

export const getTemplateGalleryPageDeleteMock = (
  variables: TemplateGalleryPageDeleteVariables
): MockedResponse<
  TemplateGalleryPageDelete,
  TemplateGalleryPageDeleteVariables
> => ({
  request: { query: TEMPLATE_GALLERY_PAGE_DELETE, variables },
  result: jest.fn(() => ({
    data: {
      templateGalleryPageDelete: {
        __typename: 'TemplateGalleryPage' as const,
        id: variables.id
      }
    }
  }))
})
