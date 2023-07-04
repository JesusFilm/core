import { ReactElement, useMemo } from 'react'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import Typography from '@mui/material/Typography'
import { GetUserTeams_userTeams as UserTeam } from '../../../../../__generated__/GetUserTeams'
import { TeamMemberListItem } from '../TeamMemberListItem'
import { GetUserTeamInvites_userTeamInvites as UserTeamInvites } from '../../../../../__generated__/GetUserTeamInvites'

interface TeamMemberListProps {
  title: string
  users: UserTeam[]
  invites?: UserTeamInvites[]
  currentUser?: UserTeam
}

export function TeamMemberList({
  title,
  users,
  invites = [],
  currentUser
}: TeamMemberListProps): ReactElement {
  const sortedUsers: UserTeam[] = useMemo(() => {
    const currentUserIndex = users?.findIndex(
      (userTeam) => userTeam.user.id === currentUser?.user.id
    )
    if (currentUserIndex > 0) {
      const current = users?.splice(currentUserIndex, 1)
      return [...current, ...users]
    }
    return users
  }, [users, currentUser])

  return (
    <>
      {users.length > 0 && currentUser != null && (
        <Box>
          <Typography variant="subtitle1"> {title}</Typography>
          <List sx={{ py: 0 }}>
            {sortedUsers.map((user) => {
              return (
                <TeamMemberListItem
                  key={user.id}
                  user={user}
                  currentUser={currentUser}
                />
              )
            })}
            {invites?.map((invite) => {
              return (
                <TeamMemberListItem
                  key={invite.id}
                  user={invite}
                  currentUser={currentUser}
                />
              )
            })}
          </List>
        </Box>
      )}
    </>
  )
}
