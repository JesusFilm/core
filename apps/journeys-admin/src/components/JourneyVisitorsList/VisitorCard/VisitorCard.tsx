import { ReactElement } from 'react'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import { Journey } from '../fakeData'
import { VisitorCardHeader } from './VisitorCardHeader'
import { VisitorCardDetails } from './VisitorCardDetails'

interface Props {
  journey: Journey
}

export function VisitorCard({ journey }: Props): ReactElement {
  const { id, name, location, source, createdAt, duration, icon, events } =
    journey
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 0,
        borderColor: 'divider',
        borderBottom: 'none',
        '&:last-of-type': {
          borderBottomLeftRadius: { xs: 0, sm: 12 },
          borderBottomRightRadius: { xs: 0, sm: 12 },
          borderBottom: '1px solid',
          borderColor: 'divider'
        },
        '&:first-of-type': {
          borderTopLeftRadius: { xs: 0, sm: 12 },
          borderTopRightRadius: { xs: 0, sm: 12 }
        }
      }}
    >
      <CardActionArea>
        <CardContent sx={{ p: 6 }}>
          <VisitorCardHeader
            icon={icon}
            name={name ?? id}
            location={location}
            source={source}
            createdAt={createdAt}
            duration={duration}
          />
          <VisitorCardDetails name={name ?? id} events={events} />
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
