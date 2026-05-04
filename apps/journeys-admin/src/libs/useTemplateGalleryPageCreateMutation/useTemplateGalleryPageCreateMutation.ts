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
      cache.modify({
        fields: {
          templateGalleryPages(existingRefs = [], { storeFieldName }) {
            // Only modify the team-scoped variant matching this create.
            // storeFieldName encodes the args: e.g. 'templateGalleryPages({"teamId":"abc"})'
            if (
              teamId != null &&
              !storeFieldName.includes(`"teamId":"${teamId}"`)
            ) {
              return existingRefs
            }
            const newRef = cache.writeFragment({
              data: data.templateGalleryPageCreate,
              fragment: gql`
                fragment NewTemplateGalleryPage on TemplateGalleryPage {
                  id
                }
              `
            })
            if (newRef == null) return existingRefs
            return [newRef, ...existingRefs]
          }
        }
      })
    },
    ...options
  })
}
