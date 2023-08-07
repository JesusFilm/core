import {
  MutationHookOptions,
  MutationTuple,
  gql,
  useMutation
} from '@apollo/client'

import {
  TeamCreate,
  TeamCreateVariables
} from '../../../__generated__/TeamCreate'
import { useTeam } from '../../components/Team/TeamProvider'

export const TEAM_CREATE = gql`
  mutation TeamCreate($input: TeamCreateInput!) {
    teamCreate(input: $input) {
      id
      title
    }
  }
`

export function useTeamCreateMutation(
  options?: MutationHookOptions<TeamCreate, TeamCreateVariables>
): MutationTuple<TeamCreate, TeamCreateVariables> {
  const { setActiveTeam } = useTeam()
  const mutation = useMutation<TeamCreate>(TEAM_CREATE, {
    update(cache, { data }) {
      if (data?.teamCreate != null) {
        cache.modify({
          fields: {
            teams(existingTeams = []) {
              const newTeamRef = cache.writeFragment({
                data: data.teamCreate,
                fragment: gql`
                  fragment NewTeam on Team {
                    id
                  }
                `
              })
              return [...existingTeams, newTeamRef]
            }
          }
        })
      }
    },
    onCompleted(data) {
      if (data?.teamCreate != null) {
        setActiveTeam(data.teamCreate)
      }
    },
    ...options
  })

  return mutation
}
