import { GetJourney_journey_blocks_VideoOverlayBlock as VideoOverlayBlock } from '../../../../__generated__/GetJourney'
import { ReactElement } from 'react'
import { RadioQuestion } from '../RadioQuestion/'
import { makeStyles, createStyles } from '@mui/styles'
import { Grid } from '@mui/material'
import { VideoOverlayLocationEnum } from '../../../../__generated__/globalTypes'
import { TreeBlock } from '../../../libs/transformer/transformer'

export type VideoOverlayProps = TreeBlock<VideoOverlayBlock> & {
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

export function VideoOverlay({
  children,
  displayOn,
  latestEvent,
  location = VideoOverlayLocationEnum.CENTER
}: VideoOverlayProps): ReactElement {
  const show = displayOn?.includes(latestEvent) ?? false
  const classes = useStyles()
  const justify = 
    location === 'CENTER' ? 'center' 
    : location === 'WEST' ? 'flex-start' 
    : 'flex-end'

  return (
    <Grid
      container
      direction="row"
      justifyContent={justify}
      alignItems="center"
      className={classes.container}
    >
      <Grid item p={2}>
        {
          children !== null && show
            ? children?.map(
              (block) => {
                if (block.__typename === 'RadioQuestionBlock') return <RadioQuestion {...block} key={block.id} />
                return null
              }
            )
            : null}
      </Grid>
    </Grid>
  )
}

export default VideoOverlay
