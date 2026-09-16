import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  TemplateGalleryPagePublish,
  TemplateGalleryPagePublishVariables
} from '../../../__generated__/TemplateGalleryPagePublish'

export const TEMPLATE_GALLERY_PAGE_PUBLISH = gql`
  mutation TemplateGalleryPagePublish($id: ID!) {
    templateGalleryPagePublish(id: $id) {
      id
      status
      publishedAt
      updatedAt
      slug
    }
  }
`

export function useTemplateGalleryPagePublishMutation(
  options?: useMutation.Options<
    TemplateGalleryPagePublish,
    TemplateGalleryPagePublishVariables
  >
): useMutation.ResultTuple<
  TemplateGalleryPagePublish,
  TemplateGalleryPagePublishVariables
> {
  return useMutation<
    TemplateGalleryPagePublish,
    TemplateGalleryPagePublishVariables
  >(TEMPLATE_GALLERY_PAGE_PUBLISH, options)
}
