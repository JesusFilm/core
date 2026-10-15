import { gql } from '@apollo/client'
import { skipToken, useQuery } from '@apollo/client/react'

import {
  GetTemplateGalleryPages,
  GetTemplateGalleryPagesVariables
} from '../../../__generated__/GetTemplateGalleryPages'

export const GET_TEMPLATE_GALLERY_PAGES = gql`
  query GetTemplateGalleryPages($teamId: ID!) {
    templateGalleryPages(teamId: $teamId) {
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

export function useTemplateGalleryPagesQuery(
  variables?: GetTemplateGalleryPagesVariables,
  options?: { skip?: boolean }
): useQuery.Result<
  GetTemplateGalleryPages,
  GetTemplateGalleryPagesVariables,
  'empty' | 'complete' | 'streaming',
  Partial<GetTemplateGalleryPagesVariables>
> {
  return useQuery<GetTemplateGalleryPages, GetTemplateGalleryPagesVariables>(
    GET_TEMPLATE_GALLERY_PAGES,
    // Apollo Client 4 requires `variables` for operations that declare
    // required ones, so both "no variables yet" and an explicit skip are
    // expressed with `skipToken`.
    variables == null || options?.skip === true ? skipToken : { variables }
  )
}
