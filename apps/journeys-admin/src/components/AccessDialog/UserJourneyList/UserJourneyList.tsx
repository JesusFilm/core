import { ReactElement } from 'react'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Skeleton from '@mui/material/Skeleton'
import List from '@mui/material/List'
import Typography from '@mui/material/Typography'
import { UserJourneyRole } from '../../../../__generated__/globalTypes'
import { GetJourneyWithUserJourneys_journey_userJourneys as UserJourney } from '../../../../__generated__/GetJourneyWithUserJourneys'
import { UserJourneyItem } from './UserJourneyItem'

interface UserJourneyListProps {
  loading?: boolean
  userJourneys?: UserJourney[] | null
  disable: boolean
}

export function UserJourneyList({
  loading,
  userJourneys,
  disable
}: UserJourneyListProps): ReactElement {
  const usersList: UserJourney[] = []
  const requestsList: UserJourney[] = []

  userJourneys?.forEach((userJourney) => {
    if (userJourney.role === UserJourneyRole.inviteRequested) {
      requestsList.push(userJourney)
    } else {
      usersList.push(userJourney)
    }
  })
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
          {requestsList.length > 0 && (
            <ListSubGroup
              title="Requested Editing Rights"
              users={requestsList}
              disable={disable}
            />
          )}

          {usersList.length > 0 && (
            <ListSubGroup
              title="Users With Access"
              users={usersList}
              disable={disable}
            />
          )}
        </>
      )}
    </>
  )
}

interface Props {
  title: string
  users: UserJourney[]
  disable: boolean
}

function ListSubGroup({ title, users, disable }: Props): ReactElement {
  return (
    <Box>
      <Divider />
      <Typography sx={{ pt: 4 }} variant="body1">
        {title}
      </Typography>

      <List sx={{ py: 0 }}>
        {users.map((userJourney) => (
          <UserJourneyItem
            key={userJourney.id}
            userJourney={userJourney}
            disabled={disable}
          />
        ))}
      </List>
    </Box>
  )
}
