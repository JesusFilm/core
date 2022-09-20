import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import { ImageBlockThumbnail } from '../../../ImageBlockThumbnail'

export function SourceEmpty(): ReactElement {
  return (
    <>
      <ImageBlockThumbnail Icon={VideocamRoundedIcon} />
      <Box flexGrow={1}>
        <Typography variant="subtitle2">Select Video</Typography>
      </Box>
      <AddRoundedIcon color="primary" />
    </>
  )
}
