import {
  FetchResult,
  MutationFunctionOptions,
  useMutation
} from '@apollo/client'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'

export const VIDEO_VARIANT_UPDATE = graphql(`
  mutation VideoVariantUpdate($id: ID!) {
    videoVariantUpdate(id: $id) {
      id
      language
    }
  }
`)

export type VideoVariantUpdate = ResultOf<typeof VIDEO_VARIANT_UPDATE>
export type VideoVariantUpdateVariables = VariablesOf<
  typeof VIDEO_VARIANT_UPDATE
>

export function useUpdateVideoVariantMutation(options) {
  const [updateMutation, result] = useMutation<
    VideoVariantUpdate,
    VideoVariantUpdateVariables
  >(VIDEO_VARIANT_UPDATE, options)

  async function wrappedMutation(
    variant: any,
    options: MutationFunctionOptions<
      VideoVariantUpdate,
      VideoVariantUpdateVariables
    >
  ): Promise<FetchResult<VideoVariantUpdate> | undefined> {
    return await updateMutation({
      variables: {
        id: variant.id
      }
    })
  }

  return [wrappedMutation, result]
}
