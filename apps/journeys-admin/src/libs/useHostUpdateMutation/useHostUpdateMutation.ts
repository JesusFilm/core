import { gql, useMutation } from '@apollo/client'

import { HostUpdateInput } from '../../../__generated__/globalTypes'
import {
  UpdateHost_hostUpdate as Host,
  UpdateHost
} from '../../../__generated__/UpdateHost'

export const UPDATE_HOST = gql`
  mutation UpdateHost($id: ID!, $teamId: ID!, $input: HostUpdateInput) {
    hostUpdate(id: $id, teamId: $teamId, input: $input) {
      id
      title
      location
      src1
      src2
    }
  }
`

interface updateHostProps {
  id: string
  teamId: string
  input: HostUpdateInput
}

export function useHostUpdateMutation(): {
  updateHost: ({
    id,
    teamId,
    input
  }: updateHostProps) => Promise<Host | undefined>
} {
  const [updateHost] = useMutation<UpdateHost>(UPDATE_HOST)

  return {
    updateHost: async ({
      id,
      teamId,
      input
    }: updateHostProps): Promise<Host | undefined> => {
      try {
        const { data } = await updateHost({
          variables: { id, teamId, input },
          update(cache, { data }) {
            if (data?.hostUpdate != null) {
              cache.modify({
                id: cache.identify({
                  __typename: 'Host',
                  id
                }),
                fields: {
                  title: () => data.hostUpdate.title,
                  location: () => data.hostUpdate.location,
                  src1: () => data.hostUpdate.src1,
                  src2: () => data.hostUpdate.src2
                }
              })
            }
          }
        })
        return data?.hostUpdate
      } catch (e) {
        return undefined
      }
    }
  }
}
