import {
  MutationHookOptions,
  MutationTuple,
  gql,
  useMutation
} from '@apollo/client'

import {
  TemplateGalleryPageReorderTemplate,
  TemplateGalleryPageReorderTemplateVariables
} from '../../../__generated__/TemplateGalleryPageReorderTemplate'

// Atomic intra-collection reorder. The server moves the journey to `order`
// within the page, shifting other rows in the affected window by ±1 so the
// final state has no gaps and no duplicates. Cross-collection moves and
// add/remove-from-collection still go through templateGalleryPageAssignJourney.
export const TEMPLATE_GALLERY_PAGE_REORDER_TEMPLATE = gql`
  mutation TemplateGalleryPageReorderTemplate(
    $pageId: ID!
    $journeyId: ID!
    $order: Int!
  ) {
    templateGalleryPageReorderTemplate(
      pageId: $pageId
      journeyId: $journeyId
      order: $order
    ) {
      id
      title
      description
      slug
      status
      creatorName
      creatorImageSrc
      creatorImageAlt
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

export function useTemplateGalleryPageReorderTemplateMutation(
  options?: MutationHookOptions<
    TemplateGalleryPageReorderTemplate,
    TemplateGalleryPageReorderTemplateVariables
  >
): MutationTuple<
  TemplateGalleryPageReorderTemplate,
  TemplateGalleryPageReorderTemplateVariables
> {
  return useMutation<
    TemplateGalleryPageReorderTemplate,
    TemplateGalleryPageReorderTemplateVariables
  >(TEMPLATE_GALLERY_PAGE_REORDER_TEMPLATE, options)
}
