import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded' // icon-replace: add video-on
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import Plus2 from '@core/shared/ui/icons/Plus2'

import { ImageBlockThumbnail } from '../../../ImageBlockThumbnail'

export function SourceEmpty(): ReactElement {
  return (
    <>
      <Box>
        <ImageBlockThumbnail Icon={VideocamRoundedIcon} />
      </Box>
      <Box flexGrow={1} minWidth={0}>
        <Typography variant="subtitle2">Select Video</Typography>
      </Box>
      <Plus2 color="primary" />
    </>
  )
}
