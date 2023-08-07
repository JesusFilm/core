import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import sortBy from 'lodash/sortBy'
import { ReactElement, useMemo } from 'react'

import { GetJourneyWithUserJourneys_journey_userJourneys as UserJourney } from '../../../../__generated__/GetJourneyWithUserJourneys'
import { GetUserInvites_userInvites as UserInvite } from '../../../../__generated__/GetUserInvites'
import { UserJourneyRole } from '../../../../__generated__/globalTypes'

import { UserListItem } from './UserListItem'

interface UserListProps {
  title: string
  users: UserJourney[]
  invites?: UserInvite[]
  loading?: boolean
  currentUser?: UserJourney
  journeyId: string
}

export function UserList({
  title,
  users,
  invites = [],
  loading,
  currentUser,
  journeyId
}: UserListProps): ReactElement {
  const sortedUsers: UserJourney[] = useMemo(() => {
    return sortBy(users, ({ role }) => {
      switch (role) {
        case UserJourneyRole.owner:
          return 0
        case UserJourneyRole.editor:
          return 1
        case UserJourneyRole.inviteRequested:
          return 2
      }
    })
  }, [users])

  return (
    <>
      {loading === true ? (
        <Box>
          <Typography variant="subtitle1">{title}</Typography>
          <List>
            {[0, 1, 2].map((i) => (
              <ListItem key={i} sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Skeleton
                    variant="circular"
                    width={40}
                    height={40}
                    sx={{ alignSelf: 'center' }}
                  />
                </ListItemAvatar>

                <ListItemText
                  primary={<Skeleton variant="text" width="60%" />}
                  secondary={<Skeleton variant="text" width="30%" />}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      ) : (
        <>
          {users.length > 0 && (
            <Box>
              <Typography variant="subtitle1">{title}</Typography>

              <List sx={{ py: 0 }}>
                {sortedUsers.map((user) => (
                  <UserListItem
                    journeyId={journeyId}
                    key={user.id}
                    listItem={user}
                    currentUser={currentUser}
                  />
                ))}
                {invites.map(
                  (invite) =>
                    invite.removedAt == null &&
                    invite.acceptedAt == null && (
                      <UserListItem
                        journeyId={journeyId}
                        key={invite.id}
                        listItem={invite}
                        currentUser={currentUser}
                      />
                    )
                )}
              </List>
            </Box>
          )}
        </>
      )}
    </>
  )
}
