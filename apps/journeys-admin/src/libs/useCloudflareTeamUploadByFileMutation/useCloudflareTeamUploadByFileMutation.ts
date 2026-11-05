import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  CreateCloudflareTeamUploadByFile,
  CreateCloudflareTeamUploadByFileVariables
} from '../../../__generated__/CreateCloudflareTeamUploadByFile'

/**
 * Campaign image upload under a team. Kept apart from the journey document
 * (`CREATE_CLOUDFLARE_UPLOAD_BY_FILE`) so journeys-admin never sends the
 * `teamId` argument on a journey upload.
 */
export const CREATE_CLOUDFLARE_TEAM_UPLOAD_BY_FILE = gql`
  mutation CreateCloudflareTeamUploadByFile($teamId: ID!) {
    createCloudflareUploadByFile(teamId: $teamId) {
      uploadUrl
      id
    }
  }
`

export function useCloudflareTeamUploadByFileMutation(
  options?: useMutation.Options<
    CreateCloudflareTeamUploadByFile,
    CreateCloudflareTeamUploadByFileVariables
  >
): useMutation.ResultTuple<
  CreateCloudflareTeamUploadByFile,
  CreateCloudflareTeamUploadByFileVariables
> {
  return useMutation<
    CreateCloudflareTeamUploadByFile,
    CreateCloudflareTeamUploadByFileVariables
  >(CREATE_CLOUDFLARE_TEAM_UPLOAD_BY_FILE, options)
}
