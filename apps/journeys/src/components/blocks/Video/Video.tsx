import { Box } from '@material-ui/core'
import { TreeBlock } from '../../../libs/transformer/transformer'
import React, { ReactElement } from 'react'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../__generated__/GetJourney'

export const Video = ({ title }: TreeBlock<VideoBlock>): ReactElement => {
  return <Box data-testid="Video">Render {title} Here</Box>
}
