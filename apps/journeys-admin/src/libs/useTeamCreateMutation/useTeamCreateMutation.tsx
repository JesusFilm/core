import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import { useTeam } from '@core/journeys/ui/TeamProvider'

import {
  TeamCreate,
  TeamCreateVariables
} from '../../../__generated__/TeamCreate'

export const TEAM_CREATE = gql`
  mutation TeamCreate($input: TeamCreateInput!) {
    teamCreate(input: $input) {
      id
      title
      publicTitle
      userTeams {
        id
        user {
          id
          firstName
          lastName
          imageUrl
          email
        }
        role
      }
      customDomains {
        id
        name
      }
    }
  }
`

export function useTeamCreateMutation(
  options?: useMutation.Options<TeamCreate, TeamCreateVariables>
): useMutation.ResultTuple<TeamCreate, TeamCreateVariables> {
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
