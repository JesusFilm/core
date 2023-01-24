import { ReactElement } from 'react'
import Divider from '@mui/material/Divider'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import Skeleton from '@mui/material/Skeleton'
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
      {((userJourneys?.length != null && userJourneys.length > 0) ||
        loading === true) && (
        <>
          <Divider sx={{ my: 2 }} />
          <ListItem sx={{ px: 0 }}>{title}</ListItem>
        </>
      )}
      {loading === true &&
        [0, 1, 2].map((i) => (
          <ListItem sx={{ px: 0 }} key={i}>
            <ListItemAvatar>
              <Skeleton variant="circular" width={40} height={40} />
            </ListItemAvatar>
            <ListItemText
              primary={<Skeleton variant="text" width="60%" />}
              secondary={<Skeleton variant="text" width="30%" />}
            />
          </ListItem>
        ))}
      {userJourneys?.map((userJourney) => (
        <UserJourneyItem
          key={userJourney.id}
          userJourney={userJourney}
          disabled={disable}
        />
      ))}
    </>
  )
}
