import { FetchResult, MutationHookOptions, useMutation } from '@apollo/client'
import { ResultOf, VariablesOf, graphql } from '@core/shared/gql'

export type UpdateLastActiveTeamId = ResultOf<typeof UPDATE_LAST_ACTIVE_TEAM_ID>
export type UpdateLastActiveTeamIdVariables = VariablesOf<
  typeof UPDATE_LAST_ACTIVE_TEAM_ID
>

export const UPDATE_LAST_ACTIVE_TEAM_ID = graphql(`
  mutation UpdateLastActiveTeamId($input: JourneyProfileUpdateInput!) {
    journeyProfileUpdate(input: $input) {
      id
    }
  }
`)

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
