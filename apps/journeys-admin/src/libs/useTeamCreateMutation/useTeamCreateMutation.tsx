import {
  MutationHookOptions,
  MutationTuple,
  gql,
  useMutation
} from '@apollo/client'

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

/** Minimal selection for guest flow: only user.id to avoid User entity field resolution errors in federation. */
export const TEAM_CREATE_GUEST = gql`
  mutation TeamCreateGuest($input: TeamCreateInput!) {
    teamCreate(input: $input) {
      id
      title
      publicTitle
      userTeams {
        id
        user {
          ... on AuthenticatedUser {
            id
          }
          ... on AnonymousUser {
            id
          }
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

/** Use for guest flow: only requests user.id to avoid federation User field resolution errors. */
export function useTeamCreateMutationGuest(
  options?: MutationHookOptions<TeamCreate, TeamCreateVariables>
): MutationTuple<TeamCreate, TeamCreateVariables> {
  const { setActiveTeam } = useTeam()
  return useMutation<TeamCreate>(TEAM_CREATE_GUEST, {
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
}
