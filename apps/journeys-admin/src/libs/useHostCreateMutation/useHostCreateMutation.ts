import {
  ApolloCache,
  MutationHookOptions,
  MutationTuple,
  gql,
  useMutation
} from '@apollo/client'

import {
  CreateHost,
  CreateHostVariables
} from '../../../__generated__/CreateHost'

export const CREATE_HOST = gql`
  mutation CreateHost($teamId: ID!, $input: HostCreateInput!) {
    hostCreate(teamId: $teamId, input: $input) {
      id
      title
    }
  }
`

export function hostCreateUpdate(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cache: ApolloCache<any>,
  data: CreateHost | null | undefined
): void {
  if (data?.hostCreate != null) {
    cache.modify({
      fields: {
        hosts(existingTeamHosts = []) {
          const newHostRef = cache.writeFragment({
            data: data.hostCreate,
            fragment: gql`
              fragment NewHost on Host {
                id
              }
            `
          })
          return [...existingTeamHosts, newHostRef]
        }
      }
    })
  }
}

export function useHostCreateMutation(
  options?: MutationHookOptions<CreateHost, CreateHostVariables>
): MutationTuple<CreateHost, CreateHostVariables> {
  return useMutation<CreateHost, CreateHostVariables>(CREATE_HOST, {
    ...options,
    update(...args) {
      options?.update?.(...args)
      const [cache, { data }] = args
      hostCreateUpdate(cache, data)
    }
  })
}
