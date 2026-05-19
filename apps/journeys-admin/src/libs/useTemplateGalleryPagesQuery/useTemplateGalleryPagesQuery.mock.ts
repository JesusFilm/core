import { MockedResponse } from '@apollo/client/testing'

import {
  GetTemplateGalleryPages,
  GetTemplateGalleryPagesVariables,
  GetTemplateGalleryPages_templateGalleryPages as Page
} from '../../../__generated__/GetTemplateGalleryPages'

import { GET_TEMPLATE_GALLERY_PAGES } from './useTemplateGalleryPagesQuery'

export const getTemplateGalleryPagesMock = (
  variables: GetTemplateGalleryPagesVariables,
  pages: readonly Page[] = []
): MockedResponse<
  GetTemplateGalleryPages,
  GetTemplateGalleryPagesVariables
> => ({
  request: { query: GET_TEMPLATE_GALLERY_PAGES, variables },
  result: jest.fn(() => ({
    data: { templateGalleryPages: [...pages] }
  }))
})
