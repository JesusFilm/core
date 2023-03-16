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
      <Typography variant="h4">Every Journey should have a goal</Typography>
      {hasActions ? (
        <Typography variant="body1">
          Here you can see the list of goals for this journey
        </Typography>
      ) : (
        <>
          <Typography>Your Journey doesnt have actions yet</Typography>
          <Typography>To add them:</Typography>
          <Typography>Add a button/poll to your card</Typography>
          <Typography>Choose an action for it</Typography>
        </>
      )}
    </>
  )
}
