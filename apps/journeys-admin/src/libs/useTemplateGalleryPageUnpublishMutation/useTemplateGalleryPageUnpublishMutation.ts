import {
  MutationHookOptions,
  MutationTuple,
  gql,
  useMutation
} from '@apollo/client'

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
  options?: MutationHookOptions<
    TemplateGalleryPageUnpublish,
    TemplateGalleryPageUnpublishVariables
  >
): MutationTuple<
  TemplateGalleryPageUnpublish,
  TemplateGalleryPageUnpublishVariables
> {
  return useMutation<
    TemplateGalleryPageUnpublish,
    TemplateGalleryPageUnpublishVariables
  >(TEMPLATE_GALLERY_PAGE_UNPUBLISH, options)
}
