import { ReactElement, useEffect, useMemo } from 'react'
import Box from '@mui/material/Box'
import List from '@mui/material/List'

import { sortBy } from 'lodash'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Skeleton from '@mui/material/Skeleton'
import ListItemText from '@mui/material/ListItemText'
import { LazyQueryExecFunction, OperationVariables } from '@apollo/client'
import { UserTeamListItem } from '../UserTeamListItem'
import {
  GetUserTeamsAndInvites,
  GetUserTeamsAndInvites_userTeams as UserTeam
} from '../../../../../__generated__/GetUserTeamsAndInvites'
import { UserTeamRole } from '../../../../../__generated__/globalTypes'
import {
  GetCurrentUser,
  GetCurrentUser_me
} from '../../../../../__generated__/GetCurrentUser'

interface UserTeamListProps {
  data: GetUserTeamsAndInvites | undefined
  currentUser: GetCurrentUser_me
  loadUser: LazyQueryExecFunction<GetCurrentUser, OperationVariables>
  loading: boolean
}

export function UserTeamList({
  data,
  currentUser,
  loadUser,
  loading
}: UserTeamListProps): ReactElement {
  const currentUserTeam: UserTeam | undefined = useMemo(() => {
    return data?.userTeams?.find(({ user: { email } }) => {
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
      {loading || data?.userTeams == null ? (
        <Box>
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
          {sortedUserTeams.length > 0 && currentUser != null && (
            <List sx={{ py: 0 }}>
              {sortedUserTeams.map((userTeam) => {
                return (
                  <UserTeamListItem
                    key={userTeam.id}
                    user={userTeam}
                    disabled={
                      currentUserTeam?.role !== UserTeamRole.manager ||
                      currentUser.email === userTeam.user.email
                    }
                  />
                )
              })}
            </List>
          )}
        </>
      )}
    </>
  )
}
