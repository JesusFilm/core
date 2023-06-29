import { ReactElement, useMemo } from 'react'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import Typography from '@mui/material/Typography'
import { UserTeams_userTeams as UserTeam } from '../../../../../__generated__/UserTeams'
import { TeamMemberListItem } from '../TeamMemberListItem'

interface TeamMemberListProps {
  title: string
  users?: UserTeam[]
  currentUser?: UserTeam
}

export function TeamMemberList({
  title,
  users = [],
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
          </List>
        </Box>
      )}
    </>
  )
}
