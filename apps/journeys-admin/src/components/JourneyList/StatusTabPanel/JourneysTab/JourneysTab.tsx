import { ReactElement } from 'react'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import { GetJourneys_journeys as Journey } from '../../../../../__generated__/GetJourneys'
import { JourneyCard } from '../../JourneyCard'
import { AddJourneyButton } from '../../AddJourneyButton'

interface JourneysTabProps {
  journeys: Journey[]
}

export function JourneysTab({ journeys }: JourneysTabProps): ReactElement {
  return (
    <>
      {journeys.map((journey) => (
        <JourneyCard key={journey.id} journey={journey} />
      ))}
      {journeys.length === 0 && (
        <Card
          variant="outlined"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            pt: 20,
            pb: 16,
            borderRadius: { xs: 0, sm: 3 }
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
