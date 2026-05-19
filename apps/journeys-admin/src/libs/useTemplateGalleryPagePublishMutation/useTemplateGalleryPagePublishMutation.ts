import {
  MutationHookOptions,
  MutationTuple,
  gql,
  useMutation
} from '@apollo/client'

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
  options?: MutationHookOptions<
    TemplateGalleryPagePublish,
    TemplateGalleryPagePublishVariables
  >
): MutationTuple<
  TemplateGalleryPagePublish,
  TemplateGalleryPagePublishVariables
> {
  return useMutation<
    TemplateGalleryPagePublish,
    TemplateGalleryPagePublishVariables
  >(TEMPLATE_GALLERY_PAGE_PUBLISH, options)
}
