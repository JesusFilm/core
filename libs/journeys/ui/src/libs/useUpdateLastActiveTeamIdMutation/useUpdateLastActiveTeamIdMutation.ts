import {
  FetchResult,
  MutationHookOptions,
  gql,
  useMutation
} from '@apollo/client'

import {
  UpdateLastActiveTeamIdMutation,
  UpdateLastActiveTeamIdMutationVariables
} from './__generated__/useUpdateLastActiveTeamIdMutation'

export const UPDATE_LAST_ACTIVE_TEAM_ID = gql`
  mutation UpdateLastActiveTeamId($input: JourneyProfileUpdateInput!) {
    journeyProfileUpdate(input: $input) {
      id
    }
  }
`

export function useUpdateLastActiveTeamIdMutation(
  options?: MutationHookOptions<
    UpdateLastActiveTeamIdMutation,
    UpdateLastActiveTeamIdMutationVariables
  >
): (
  options?: MutationHookOptions<
    UpdateLastActiveTeamIdMutation,
    UpdateLastActiveTeamIdMutationVariables
  >
) => Promise<FetchResult<UpdateLastActiveTeamIdMutation> | undefined> {
  const [updateLastActiveTeamId] = useMutation<
    UpdateLastActiveTeamIdMutation,
    UpdateLastActiveTeamIdMutationVariables
  >(UPDATE_LAST_ACTIVE_TEAM_ID, options)

  return updateLastActiveTeamId
}
