import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import Plus2 from '@core/shared/ui/icons/Plus2'
import VideoOn from '@core/shared/ui/icons/VideoOn'

import { ImageBlockThumbnail } from '../../../ImageBlockThumbnail'

export function SourceEmpty(): ReactElement {
  return (
    <>
      <Box>
        <ImageBlockThumbnail Icon={VideoOn} />
      </Box>
      <Box flexGrow={1} minWidth={0}>
        <Typography variant="subtitle2">Select Video</Typography>
      </Box>
      <Plus2 color="primary" />
    </>
  )
}
