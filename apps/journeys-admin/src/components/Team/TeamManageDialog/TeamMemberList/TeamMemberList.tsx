import { ReactElement, useEffect, useMemo } from 'react'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import Typography from '@mui/material/Typography'

import { sortBy } from 'lodash'
import { TeamMemberListItem } from '../TeamMemberListItem'
import { useUserTeamsAndInvitesQuery } from '../../../../libs/useUserTeamsAndInvitesQuery'
import { useTeam } from '../../TeamProvider'
import { useCurrentUser } from '../../../../libs/useCurrentUser'
import { GetUserTeamsAndInvites_userTeams as UserTeam } from '../../../../../__generated__/GetUserTeamsAndInvites'
import { UserTeamRole } from '../../../../../__generated__/globalTypes'

export function TeamMemberList({ title }: { title?: string }): ReactElement {
  const { activeTeam } = useTeam()
  const { loadUser, data: currentUser } = useCurrentUser()
  const { data } = useUserTeamsAndInvitesQuery(
    activeTeam != null
      ? {
          teamId: activeTeam.id
        }
      : undefined
  )
  const currentUserTeam: UserTeam | undefined = useMemo(() => {
    return data?.userTeams?.find(({ user: { email } }) => {
      console.log('UserTeams User id', email)
      console.log('CurrentUser Id', currentUser.id)
      return email === currentUser?.email
    })
  }, [data, currentUser])

  const sortedUserTeams: UserTeam[] = useMemo(() => {
    return (
      sortBy(data?.userTeams ?? [], ({ user: { id } }) =>
        id === currentUser?.id ? 0 : 1
      ) ?? []
    )
  }, [data, currentUser])

  useEffect(() => {
    void loadUser()
  }, [loadUser])

  return (
    <>
      {sortedUserTeams.length > 0 && currentUser != null && (
        <Box>
          <Typography variant="subtitle1"> {title}</Typography>
          <List sx={{ py: 0 }}>
            {sortedUserTeams.map((userTeam) => {
              return (
                <TeamMemberListItem
                  key={userTeam.id}
                  user={userTeam}
                  disabled={
                    currentUserTeam?.role !== UserTeamRole.manager ||
                    currentUser.email === userTeam.user.email
                  }
                />
              )
            })}
            {data?.userTeamInvites?.map((userTeamInvite) => {
              return (
                <TeamMemberListItem
                  key={userTeamInvite.id}
                  user={userTeamInvite}
                  disabled={currentUserTeam?.role !== UserTeamRole.manager}
                />
              )
            })}
          </List>
        </Box>
      )}
    </>
  )
}
