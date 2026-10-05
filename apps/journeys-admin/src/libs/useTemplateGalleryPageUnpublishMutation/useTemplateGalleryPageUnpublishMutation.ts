import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  TemplateGalleryPageUnpublish,
  TemplateGalleryPageUnpublishVariables
} from '../../../__generated__/TemplateGalleryPageUnpublish'

export const TEMPLATE_GALLERY_PAGE_UNPUBLISH = gql`
  mutation TemplateGalleryPageUnpublish($id: ID!) {
    templateGalleryPageUnpublish(id: $id) {
      id
      status
      publishedAt
      updatedAt
    }
  }
`

export function useTemplateGalleryPageUnpublishMutation(
  options?: useMutation.Options<
    TemplateGalleryPageUnpublish,
    TemplateGalleryPageUnpublishVariables
  >
): useMutation.ResultTuple<
  TemplateGalleryPageUnpublish,
  TemplateGalleryPageUnpublishVariables
> {
  return useMutation<
    TemplateGalleryPageUnpublish,
    TemplateGalleryPageUnpublishVariables
  >(TEMPLATE_GALLERY_PAGE_UNPUBLISH, options)
}
