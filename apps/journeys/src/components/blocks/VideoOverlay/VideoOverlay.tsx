import { GetJourney_journey_blocks_VideoOverlayBlock as VideoOverlayBlock } from '../../../../__generated__/GetJourney'
import { ReactElement } from 'react'
import { RadioQuestion } from '../RadioQuestion/'
import { makeStyles, createStyles } from '@mui/styles'
import { Grid } from '@mui/material'

type VideoOverlayProps = VideoOverlayBlock & {
  latestEvent
}

const useStyles = makeStyles(
  () =>
    createStyles({
      container: {
        width: '100%',
        height: '100%'
      }
    }),
  { name: 'VideoOverlay' }
)

export function VideoOverlay ({
  children,
  displayOn,
  latestEvent,
  location = 'flex-start'
}: VideoOverlayProps): ReactElement {
  const show = displayOn.includes(latestEvent)
  const classes = useStyles()

  return (
    <Grid
      container
      direction="row"
      justifyContent={location}
      alignItems="center"
      className={classes.container}
    >
      <Grid item p={2}>
        {
        children != null && show
          ? children?.map(
            (block) => {
              if (block.__typename === 'RadioQuestion') return <RadioQuestion {...block} key={block.id} />
              return null
            }
          )
          : null}
      </Grid>
    </Grid>
  )
}

export default VideoOverlay
