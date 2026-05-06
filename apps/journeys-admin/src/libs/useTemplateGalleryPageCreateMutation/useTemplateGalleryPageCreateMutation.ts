import {
  MutationHookOptions,
  MutationTuple,
  gql,
  useMutation
} from '@apollo/client'

import {
  TemplateGalleryPageCreate,
  TemplateGalleryPageCreateVariables
} from '../../../__generated__/TemplateGalleryPageCreate'
import {
  GetTemplateGalleryPages,
  GetTemplateGalleryPagesVariables
} from '../../../__generated__/GetTemplateGalleryPages'
import { GET_TEMPLATE_GALLERY_PAGES } from '../useTemplateGalleryPagesQuery'

export const TEMPLATE_GALLERY_PAGE_CREATE = gql`
  mutation TemplateGalleryPageCreate(
    $input: TemplateGalleryPageCreateInput!
  ) {
    templateGalleryPageCreate(input: $input) {
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
      team {
        id
      }
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

export function useTemplateGalleryPageCreateMutation(
  options?: MutationHookOptions<
    TemplateGalleryPageCreate,
    TemplateGalleryPageCreateVariables
  >
): MutationTuple<
  TemplateGalleryPageCreate,
  TemplateGalleryPageCreateVariables
> {
  return useMutation<
    TemplateGalleryPageCreate,
    TemplateGalleryPageCreateVariables
  >(TEMPLATE_GALLERY_PAGE_CREATE, {
    update(cache, { data }) {
      if (data?.templateGalleryPageCreate == null) return
      const teamId = data.templateGalleryPageCreate.team?.id
      if (teamId == null) return
      // Prepend to the team-scoped query result. Targeting the exact
      // (query, variables) pair avoids the previous storeFieldName
      // substring-matching, which depended on Apollo argument
      // serialization order. If the team's list isn't cached, this
      // is a no-op — Apollo will fetch fresh on next read.
      cache.updateQuery<
        GetTemplateGalleryPages,
        GetTemplateGalleryPagesVariables
      >(
        { query: GET_TEMPLATE_GALLERY_PAGES, variables: { teamId } },
        (existing) => {
          if (existing == null) return existing
          if (
            existing.templateGalleryPages.some(
              (page) => page.id === data.templateGalleryPageCreate.id
            )
          ) {
            return existing
          }
          return {
            templateGalleryPages: [
              data.templateGalleryPageCreate,
              ...existing.templateGalleryPages
            ]
          }
        }
      )
    },
    ...options
  })
}
