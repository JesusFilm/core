import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  CreateCloudflareUploadByUrl,
  CreateCloudflareUploadByUrlVariables
} from '../../../__generated__/CreateCloudflareUploadByUrl'

/**
 * Fetch a pasted image URL into Cloudflare Images under a team (a campaign
 * edit) or a journey; the returned `url` is the imagedelivery.net address
 * the campaign stores.
 */
export const CREATE_CLOUDFLARE_UPLOAD_BY_URL = gql`
  mutation CreateCloudflareUploadByUrl(
    $url: String!
    $journeyId: ID
    $teamId: ID
  ) {
    createCloudflareUploadByUrl(
      url: $url
      journeyId: $journeyId
      teamId: $teamId
    ) {
      id
      url
    }
  }
`

export function useCloudflareUploadByUrlMutation(
  options?: useMutation.Options<
    CreateCloudflareUploadByUrl,
    CreateCloudflareUploadByUrlVariables
  >
): useMutation.ResultTuple<
  CreateCloudflareUploadByUrl,
  CreateCloudflareUploadByUrlVariables
> {
  return useMutation<
    CreateCloudflareUploadByUrl,
    CreateCloudflareUploadByUrlVariables
  >(CREATE_CLOUDFLARE_UPLOAD_BY_URL, options)
}
