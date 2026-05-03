import {
  MutationHookOptions,
  MutationTuple,
  gql,
  useMutation
} from '@apollo/client'

import {
  TemplateGalleryPageUpdate,
  TemplateGalleryPageUpdateVariables
} from '../../../__generated__/TemplateGalleryPageUpdate'

export const TEMPLATE_GALLERY_PAGE_UPDATE = gql`
  mutation TemplateGalleryPageUpdate(
    $id: ID!
    $input: TemplateGalleryPageUpdateInput!
  ) {
    templateGalleryPageUpdate(id: $id, input: $input) {
      id
      title
      description
      slug
      status
      creatorName
      creatorImageBlock {
        id
        ... on ImageBlock {
          src
          alt
        }
      }
      mediaUrl
      publishedAt
      createdAt
      updatedAt
      templates {
        id
        title
        primaryImageBlock {
          id
          src
          alt
        }
      }
    }
  }
`

export function useTemplateGalleryPageUpdateMutation(
  options?: MutationHookOptions<
    TemplateGalleryPageUpdate,
    TemplateGalleryPageUpdateVariables
  >
): MutationTuple<
  TemplateGalleryPageUpdate,
  TemplateGalleryPageUpdateVariables
> {
  return useMutation<
    TemplateGalleryPageUpdate,
    TemplateGalleryPageUpdateVariables
  >(TEMPLATE_GALLERY_PAGE_UPDATE, options)
}
