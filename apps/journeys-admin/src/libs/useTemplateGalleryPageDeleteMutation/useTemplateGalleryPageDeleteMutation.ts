import { Reference, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  TemplateGalleryPageDelete,
  TemplateGalleryPageDeleteVariables
} from '../../../__generated__/TemplateGalleryPageDelete'

export const TEMPLATE_GALLERY_PAGE_DELETE = gql`
  mutation TemplateGalleryPageDelete($id: ID!) {
    templateGalleryPageDelete(id: $id) {
      id
    }
  }
`

export function useTemplateGalleryPageDeleteMutation(
  options?: useMutation.Options<
    TemplateGalleryPageDelete,
    TemplateGalleryPageDeleteVariables
  >
): useMutation.ResultTuple<
  TemplateGalleryPageDelete,
  TemplateGalleryPageDeleteVariables
> {
  return useMutation<
    TemplateGalleryPageDelete,
    TemplateGalleryPageDeleteVariables
  >(TEMPLATE_GALLERY_PAGE_DELETE, {
    update(cache, { data }) {
      if (data?.templateGalleryPageDelete == null) return
      const deletedId = data.templateGalleryPageDelete.id
      cache.modify({
        fields: {
          templateGalleryPages(existingRefs = [], { readField }) {
            return (existingRefs as readonly Reference[]).filter(
              (ref) => readField('id', ref) !== deletedId
            )
          }
        }
      })
      cache.evict({
        id: cache.identify({
          __typename: 'TemplateGalleryPage',
          id: deletedId
        })
      })
      cache.gc()
    },
    ...options
  })
}
