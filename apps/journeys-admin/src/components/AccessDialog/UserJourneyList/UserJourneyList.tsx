import { ReactElement } from 'react'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Skeleton from '@mui/material/Skeleton'
import List from '@mui/material/List'
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
          <Divider />
          <Skeleton variant="text" width="30%" sx={{ mt: 4 }} />
          {[0, 1, 2].map((i) => (
            <Stack key={i} direction="row" spacing={2} sx={{ mt: 3 }}>
              <Skeleton
                variant="circular"
                width={40}
                height={40}
                sx={{ alignSelf: 'center' }}
              />
              <Stack direction="column" sx={{ width: '100%' }}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="30%" />
              </Stack>
            </Stack>
          ))}
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
                  <UserJourneyItem
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
