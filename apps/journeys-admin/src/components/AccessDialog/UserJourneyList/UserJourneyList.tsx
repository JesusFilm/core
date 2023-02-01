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
import { UserJourneyItem } from './UserJourneyItem'

interface UserJourneyListProps {
  title: string
  loading?: boolean
  userJourneys?: UserJourney[] | null
  disable: boolean
}

export function UserJourneyList({
  title,
  loading,
  userJourneys,
  disable
}: UserJourneyListProps): ReactElement {
  return (
    <>
      {loading === true ? (
        <Box>
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
          <Divider />
        </Box>
      ) : (
        <>
          {userJourneys != null && userJourneys.length > 0 && (
            <Box>
              <Typography sx={{ pt: 4 }} variant="body1">
                {title}
              </Typography>

              <List sx={{ py: 0 }}>
                {userJourneys.map((userJourney) => (
                  <UserJourneyItem
                    key={userJourney.id}
                    userJourney={userJourney}
                    disabled={disable}
                  />
                ))}
              </List>
              <Divider />
            </Box>
          )}
        </>
      )}
    </>
  )
}
