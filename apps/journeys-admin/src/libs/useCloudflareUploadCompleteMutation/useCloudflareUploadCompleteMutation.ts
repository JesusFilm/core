import {
  MutationHookOptions,
  MutationTuple,
  gql,
  useMutation
} from '@apollo/client'

import {
  CloudflareUploadComplete,
  CloudflareUploadCompleteVariables
} from '../../../__generated__/CloudflareUploadComplete'

export const CLOUDFLARE_UPLOAD_COMPLETE = gql`
  mutation CloudflareUploadComplete($id: ID!) {
    cloudflareUploadComplete(id: $id)
  }
`

export function useCloudflareUploadCompleteMutation(
  options?: MutationHookOptions<
    CloudflareUploadComplete,
    CloudflareUploadCompleteVariables
  >
): MutationTuple<CloudflareUploadComplete, CloudflareUploadCompleteVariables> {
  return useMutation<CloudflareUploadComplete, CloudflareUploadCompleteVariables>(
    CLOUDFLARE_UPLOAD_COMPLETE,
    options
  )
}
