import { MutationHookOptions, MutationTuple, useMutation } from '@apollo/client'
import { ResultOf, VariablesOf, graphql } from 'gql.tada'

export const DELETE_CLOUDFLARE_R2_ASSET = graphql(`
  mutation DeleteCloudflareR2Asset($id: ID!) {
    cloudflareR2Delete(id: $id) {
      id
    }
  }
`)

export type DeleteCloudflareR2AssetVariables = VariablesOf<
  typeof DELETE_CLOUDFLARE_R2_ASSET
>
export type DeleteCloudflareR2Asset = ResultOf<
  typeof DELETE_CLOUDFLARE_R2_ASSET
>

export function useDeleteR2AssetMutation(
  options?: MutationHookOptions<
    DeleteCloudflareR2Asset,
    DeleteCloudflareR2AssetVariables
  >
): MutationTuple<DeleteCloudflareR2Asset, DeleteCloudflareR2AssetVariables> {
  const mutation = useMutation<
    DeleteCloudflareR2Asset,
    DeleteCloudflareR2AssetVariables
  >(DELETE_CLOUDFLARE_R2_ASSET, options)

  return mutation
}
