import {
  FetchResult,
  MutationHookOptions,
  gql,
  useMutation
} from '@apollo/client'

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
  options?: MutationHookOptions<
    UpdateLastActiveTeamId,
    UpdateLastActiveTeamIdVariables
  >
): (
  options?: MutationHookOptions<
    UpdateLastActiveTeamId,
    UpdateLastActiveTeamIdVariables
  >
) => Promise<FetchResult<UpdateLastActiveTeamId> | undefined> {
  const [updateLastActiveTeamId] = useMutation<
    UpdateLastActiveTeamId,
    UpdateLastActiveTeamIdVariables
  >(UPDATE_LAST_ACTIVE_TEAM_ID, options)

  return updateLastActiveTeamId
}
