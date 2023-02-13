import { ReactElement } from 'react'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import { GetJourneyWithUserJourneys_journey_userJourneys as UserJourney } from '../../../../__generated__/GetJourneyWithUserJourneys'
import { UserListItem } from './UserListItem'

interface UserListProps {
  title: string
  loading?: boolean
  userJourneys?: UserJourney[] | null
  disable: boolean
}

export function UserList({
  title,
  loading,
  userJourneys,
  disable
}: UserListProps): ReactElement {
  return (
    <>
      {loading === true ? (
        <Box>
          <Divider />
          <Typography sx={{ pt: 4 }} variant="body1">
            {title}
          </Typography>
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
          {userJourneys != null && userJourneys.length > 0 && (
            <Box>
              <Divider />
              <Typography sx={{ pt: 4 }} variant="body1">
                {title}
              </Typography>

              <List sx={{ py: 0 }}>
                {userJourneys.map((userJourney) => (
                  <UserListItem
                    key={userJourney.id}
                    userJourney={userJourney}
                    disabled={disable}
                  />
                ))}
              </List>
            </Box>
          )}
        </>
      )}
    </>
  )
}
