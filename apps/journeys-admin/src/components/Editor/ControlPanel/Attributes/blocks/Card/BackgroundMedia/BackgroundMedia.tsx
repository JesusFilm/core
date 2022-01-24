import { TreeBlock } from '@core/journeys/ui'
import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import {
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../../../../../__generated__/GetJourney'

interface BackgroundMediaProps {
  id: string
  coverBlock?: TreeBlock<ImageBlock | VideoBlock>
}

export function BackgroundMedia({
  id,
  coverBlock
}: BackgroundMediaProps): ReactElement {
  return (
    <>
      <Box sx={{ px: 6, py: 4 }}>Source</Box>
    </>
  )
}
