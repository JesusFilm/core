import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'

interface ActionsBannerProps {
  hasActions: boolean
}

export function ActionsBanner({
  hasActions
}: ActionsBannerProps): ReactElement {
  return (
    <>
      {hasActions ? (
        <Typography variant="subtitle1" gutterBottom>
          A list of goals for this journey
        </Typography>
      ) : (
        <>
          <Typography variant="h3" gutterBottom>
            Define a Goal for Your Journey
          </Typography>
          <Typography variant="body1" gutterBottom>
            Your journey currently has no actions. Start adding them and
            achieving your goals. Follow these steps:{' '}
          </Typography>
          <Typography variant="body1">
            Clid the &quot;Add&quot; button or poll in your card
          </Typography>
          <Typography variant="body1">
            Choose an action that align with your goals
          </Typography>
          <Typography variant="body1">
            Start editin your journey and making progress towards your
            objective!
          </Typography>
        </>
      )}
    </>
  )
}
