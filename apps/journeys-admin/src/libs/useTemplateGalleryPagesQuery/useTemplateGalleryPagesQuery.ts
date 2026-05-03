import { QueryResult, gql, useQuery } from '@apollo/client'

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

export function useTemplateGalleryPagesQuery(
  variables?: GetTemplateGalleryPagesVariables,
  options?: { skip?: boolean }
): QueryResult<GetTemplateGalleryPages, GetTemplateGalleryPagesVariables> {
  return useQuery<GetTemplateGalleryPages, GetTemplateGalleryPagesVariables>(
    GET_TEMPLATE_GALLERY_PAGES,
    {
      variables,
      skip: options?.skip
    }
  )
}
