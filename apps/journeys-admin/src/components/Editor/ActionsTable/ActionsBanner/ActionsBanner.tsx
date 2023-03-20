import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'

export function ActionsBanner(): ReactElement {
  return (
    <>
      <Typography variant="caption" gutterBottom>
        Goals
      </Typography>
      <Typography variant="h1" gutterBottom>
        Every Journey has a goal
      </Typography>
      <Typography variant="body2">
        On this screen you will see all your goals and actions listed in a
        single table. Create cards with some actions like buttons. We will list
        all your links and actions here so you can:
      </Typography>
      <Typography variant="subtitle2">
        Check all URLs and actions used in the journey
      </Typography>
      <Typography variant="subtitle2">
        Assign a goal to each action and monitor it
      </Typography>
      <Typography variant="subtitle2">
        Change all URLs in a single place
      </Typography>
    </>
  )
}
