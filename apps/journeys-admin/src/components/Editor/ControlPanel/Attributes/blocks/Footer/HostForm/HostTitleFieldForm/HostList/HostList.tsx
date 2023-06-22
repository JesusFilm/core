import List from '@mui/material/List'
import { ReactElement } from 'react'
import { gql, useQuery } from '@apollo/client'
import { HostListItem } from '../HostListItem'

export const GET_ALL_TEAM_HOSTS = gql`
  query Hosts($teamId: ID!) {
    hosts(teamId: $teamId) {
      id
      location
      src1
      src2
      title
    }
  }
`

export function HostList(): ReactElement {
  const { data } = useQuery(GET_ALL_TEAM_HOSTS, {
    variables: { teamId: 'jfp-team' }
  })

  return (
    <List disablePadding>
      {data?.hosts.map((host) => {
        return (
          <HostListItem
            key={host.id}
            hostTitle={host.title}
            hostLocation={host.location ?? ''}
            avatarSrc1={host.src1 ?? undefined}
            avatarSrc2={host.src2 ?? undefined}
          />
        )
      })}
    </List>
  )
}
