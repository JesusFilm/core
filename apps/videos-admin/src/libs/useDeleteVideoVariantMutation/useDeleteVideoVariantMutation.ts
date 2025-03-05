import { MutationHookOptions, useMutation } from '@apollo/client'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'

export const DELETE_VIDEO_VARIANT = graphql(`
  mutation DeleteVideoVariant($id: ID!) {
    videoVariantDelete(id: $id) {
      id
      videoId
      slug
      language {
        id
        name {
          value
          primary
        }
      }
    }
  }
`)

export type DeleteVideoVariantVariables = VariablesOf<
  typeof DELETE_VIDEO_VARIANT
>
export type DeleteVideoVariantResult = ResultOf<typeof DELETE_VIDEO_VARIANT>

export function useDeleteVideoVariantMutation(
  options?: MutationHookOptions<
    DeleteVideoVariantResult,
    DeleteVideoVariantVariables
  >
) {
  return useMutation(DELETE_VIDEO_VARIANT, {
    update(cache, { data }) {
      if (!data?.videoVariantDelete) return
      cache.evict({
        id: cache.identify({
          __typename: 'VideoVariant',
          id: data.videoVariantDelete.id
        })
      })
    },
    ...options
  })
}
