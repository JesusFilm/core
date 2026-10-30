import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  CreateCloudflareTeamUploadByUrl,
  CreateCloudflareTeamUploadByUrlVariables
} from '../../../__generated__/CreateCloudflareTeamUploadByUrl'

/**
 * Fetch a pasted image URL into Cloudflare Images under a team (a campaign
 * edit) or a journey; the returned `url` is the imagedelivery.net address
 * the campaign stores.
 *
 * A journey caller must get its own `($journeyId)` document rather than reuse
 * this one.
 *
 * Fetching the image can take seconds, so the mutation skips the app-wide
 * mutation queue (merged into any context the caller passes) rather than hold
 * every other save behind it.
 */
export const CREATE_CLOUDFLARE_TEAM_UPLOAD_BY_URL = gql`
  mutation CreateCloudflareTeamUploadByUrl(
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

export function useCloudflareTeamUploadByUrlMutation(
  options?: useMutation.Options<
    CreateCloudflareTeamUploadByUrl,
    CreateCloudflareTeamUploadByUrlVariables
  >
): useMutation.ResultTuple<
  CreateCloudflareTeamUploadByUrl,
  CreateCloudflareTeamUploadByUrlVariables
> {
  return useMutation<
    CreateCloudflareTeamUploadByUrl,
    CreateCloudflareTeamUploadByUrlVariables
  >(CREATE_CLOUDFLARE_TEAM_UPLOAD_BY_URL, {
    ...options,
    context: { ...options?.context, skipQueue: true }
  })
}
