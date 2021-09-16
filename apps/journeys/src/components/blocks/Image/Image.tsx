import { ReactElement } from 'react'
import { makeStyles, createStyles } from '@mui/styles'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'

const useStyles = makeStyles(
  () =>
    createStyles({
      size: {
        maxWidth: '100%',
        maxHeight: '100%'
      }
    }),
  { name: 'MuiImageComponent' }
)

export function Image({
  src,
  backgroundColor,
  fontColor,
  alt
}: TreeBlock<ImageBlock>): ReactElement {
  const classes = useStyles()

  const style = {
    ...(Boolean(backgroundColor)) && { backgroundColor: backgroundColor },
    ...(Boolean(fontColor)) && { color: fontColor },
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src} 
      alt={alt}
      className={classes.size} 
      style={style}
    />
  )
}