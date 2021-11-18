import { ReactElement } from 'react'
import { Button, Card } from '@mui/material'
import { GetJourneys_journeys as Journey } from '../../../../../__generated__/GetJourneys'

interface JourneysListCardProps {
  journey: Journey
}

const JourneyListCard = ({ journey }: JourneysListCardProps): ReactElement => {
  return (
    <Card>
      {/* Update according to wireframe */}
      <Button variant="contained" fullWidth>
        {journey.title}
      </Button>
    </Card>
  )
}

export default JourneyListCard
