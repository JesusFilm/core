import AddRoundedIcon from '@mui/icons-material/AddRounded'
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

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
      <AddRoundedIcon color="primary" />
    </>
  )
}
