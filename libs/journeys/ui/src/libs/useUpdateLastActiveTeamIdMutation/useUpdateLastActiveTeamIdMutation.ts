import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  UpdateLastActiveTeamId,
  UpdateLastActiveTeamIdVariables
} from './__generated__/UpdateLastActiveTeamId'

export const UPDATE_LAST_ACTIVE_TEAM_ID = gql`
  mutation UpdateLastActiveTeamId($input: JourneyProfileUpdateInput!) {
    journeyProfileUpdate(input: $input) {
      id
    }
  }
`

export function useUpdateLastActiveTeamIdMutation(
  options?: useMutation.Options<
    UpdateLastActiveTeamId,
    UpdateLastActiveTeamIdVariables
  >
): useMutation.MutationFunction<
  UpdateLastActiveTeamId,
  UpdateLastActiveTeamIdVariables
> {
  const [updateLastActiveTeamId] = useMutation<
    UpdateLastActiveTeamId,
    UpdateLastActiveTeamIdVariables
  >(UPDATE_LAST_ACTIVE_TEAM_ID, options)

  return updateLastActiveTeamId
}
