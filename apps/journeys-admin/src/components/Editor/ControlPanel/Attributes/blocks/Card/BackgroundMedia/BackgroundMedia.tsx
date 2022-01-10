import { TreeBlock } from '@core/journeys/ui'
import { ReactElement } from 'react'
import { Box } from '@mui/material'
import {
  GetJourneyForEdit_journey_blocks_ImageBlock as ImageBlock,
  GetJourneyForEdit_journey_blocks_VideoBlock as VideoBlock
} from '../../../../../../../../__generated__/GetJourneyForEdit'

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
