import { MutationHookOptions, MutationTuple, useMutation } from '@apollo/client'

import { ResultOf, VariablesOf, graphql } from '@core/shared/gql'

export const CREATE_CLOUDFLARE_R2_ASSET = graphql(`
  mutation CreateCloudflareR2Asset($input: CloudflareR2CreateInput!) {
    cloudflareR2Create(input: $input) {
      id
      fileName
      originalFilename
      uploadUrl
      publicUrl
    }
  }
`)

export type CreateCloudflareR2AssetVariables = VariablesOf<
  typeof CREATE_CLOUDFLARE_R2_ASSET
>
export type CreateCloudflareR2Asset = ResultOf<
  typeof CREATE_CLOUDFLARE_R2_ASSET
>

export function useCreateR2AssetMutation(
  options?: MutationHookOptions<
    CreateCloudflareR2Asset,
    CreateCloudflareR2AssetVariables
  >
): MutationTuple<CreateCloudflareR2Asset, CreateCloudflareR2AssetVariables> {
  const mutation = useMutation<
    CreateCloudflareR2Asset,
    CreateCloudflareR2AssetVariables
  >(CREATE_CLOUDFLARE_R2_ASSET, options)

  return mutation
}
