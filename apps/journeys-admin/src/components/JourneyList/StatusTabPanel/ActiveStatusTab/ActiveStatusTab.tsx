import { ReactElement } from 'react'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { GetJourneys_journeys as Journey } from '../../../../../__generated__/GetJourneys'
import { JourneyCard } from '../../JourneyCard'
import { AddJourneyButton } from '../../AddJourneyButton'

export interface ActiveStatusTabProps {
  journeys: Journey[]
}

export function ActiveStatusTab({
  journeys
}: ActiveStatusTabProps): ReactElement {
  return (
    <>
      {/* Cant test the filter until the more statuses are added */}
      {journeys.map(
        (journey) =>
          (journey.status === 'published' || journey.status === 'draft') && (
            <JourneyCard key={journey.id} journey={journey} />
          )
      )}
      {journeys.length === 0 && (
        <Card
          variant="outlined"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            pt: 20,
            pb: 16,
            borderBottomLeftRadius: { xs: 0, sm: 12 },
            borderBottomRightRadius: { xs: 0, sm: 12 },
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0
          }}
        >
          <Typography variant="subtitle1" align="center" gutterBottom>
            No journeys to display.
          </Typography>
          <Typography variant="caption" align="center" gutterBottom>
            Create a journey, then find it here.
          </Typography>
          <AddJourneyButton variant="button" />
        </Card>
      )}
    </>
  )
}
