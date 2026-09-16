import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

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
      creatorImageSrc
      creatorImageAlt
      media {
        id
        type
        muxVideoId
        embedUrl
        muxPlaybackId
        muxName
        muxDuration
      }
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
  options?: useMutation.Options<
    TemplateGalleryPageUpdate,
    TemplateGalleryPageUpdateVariables
  >
): useMutation.ResultTuple<
  TemplateGalleryPageUpdate,
  TemplateGalleryPageUpdateVariables
> {
  return useMutation<
    TemplateGalleryPageUpdate,
    TemplateGalleryPageUpdateVariables
  >(TEMPLATE_GALLERY_PAGE_UPDATE, options)
}
