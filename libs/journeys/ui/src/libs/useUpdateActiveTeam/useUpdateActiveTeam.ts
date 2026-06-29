import { useMutation } from '@apollo/client'

import { useTeam } from '../../components/TeamProvider'
import { UPDATE_LAST_ACTIVE_TEAM_ID } from '../useUpdateLastActiveTeamIdMutation'
import { UpdateLastActiveTeamId } from '../useUpdateLastActiveTeamIdMutation/__generated__/UpdateLastActiveTeamId'

/**
 * Returns a function that switches the user's active team to `teamId`,
 * persists it as the last active team, and refetches the admin journey list so
 * the destination team's journeys load.
 *
 * Shared by the copy-to-team and use-template flows so the team switch — and
 * the GetAdminJourneys refetch it triggers — lives in one place.
 *
 * @returns {(teamId: string) => void} `updateActiveTeam` — switches to the team
 *   with the given id (or clears the active team if it isn't in the list).
 */
export function useUpdateActiveTeam(): (teamId: string) => void {
  const { query, setActiveTeam } = useTeam()
  const [updateLastActiveTeamId, { client }] =
    useMutation<UpdateLastActiveTeamId>(UPDATE_LAST_ACTIVE_TEAM_ID)

  return (teamId: string): void => {
    const teams = query?.data?.teams ?? []
    setActiveTeam(teams.find((team) => team.id === teamId) ?? null)
    void updateLastActiveTeamId({
      variables: {
        input: {
          lastActiveTeamId: teamId
        }
      },
      onCompleted() {
        void client.refetchQueries({ include: ['GetAdminJourneys'] })
      }
    })
  }
}
