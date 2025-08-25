import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import Skeleton from '@mui/material/Skeleton'
import sortBy from 'lodash/sortBy'
import { ReactElement, useMemo } from 'react'

import {
  GetJourneyWithPermissions_journey_team as JourneyTeam,
  GetJourneyWithPermissions_journey_team_userTeams as JourneyTeamUserTeam
} from '../../../../../__generated__/GetJourneyWithPermissions'
import {
  GetUserTeamsAndInvites,
  GetUserTeamsAndInvites_userTeams as UserTeam
} from '../../../../../__generated__/GetUserTeamsAndInvites'
import { UserTeamRole } from '../../../../../__generated__/globalTypes'

import { UserTeamListItem } from './UserTeamListItem'

interface UserTeamListProps {
  data: undefined | JourneyTeam | GetUserTeamsAndInvites
  currentUserTeam: JourneyTeamUserTeam | undefined | UserTeam
  loading: boolean
  variant?: 'readonly' | 'default'
  journeyId?: string
}

export function UserTeamList({
  data,
  currentUserTeam,
  loading,
  variant = 'default',
  journeyId
}: UserTeamListProps): ReactElement {
  const sortedUserTeams: JourneyTeamUserTeam[] | UserTeam[] = useMemo(() => {
    if (variant === 'readonly') return data?.userTeams ?? []
    return (
      sortBy(data?.userTeams ?? [], ({ user: { id } }) =>
        id === currentUserTeam?.id ? 0 : 1
      ) ?? []
    )
  }, [data, currentUserTeam, variant])

  return (
    <>
      {loading || data?.userTeams == null || data?.userTeams?.length === 0 ? (
        <Box>
          <List>
            {[0, 1, 2].map((i) => (
              <ListItem key={i} sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Skeleton
                    data-testid="loading-skeleton"
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
          {sortedUserTeams.length > 0 && (variant === 'readonly' || currentUserTeam != null) && (
            <>
              {sortedUserTeams.map((userTeam) => {
                return (
                  <UserTeamListItem
                    key={userTeam.id}
                    user={userTeam}
                    disabled={
                      currentUserTeam?.role !== UserTeamRole.manager ||
                      currentUserTeam?.user?.email === userTeam.user.email ||
                      variant === 'readonly'
                    }
                    variant={variant}
                    journeyId={journeyId}
                    currentUserTeam={currentUserTeam}
                  />
                )
              })}
            </>
          )}
        </>
      )}
    </>
  )
}
