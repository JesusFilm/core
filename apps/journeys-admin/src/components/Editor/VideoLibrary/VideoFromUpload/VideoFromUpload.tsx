import { ReactElement } from 'react'
import Stack from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../__generated__/GetJourney'
import {
  VideoBlockUpdateInput,
  VideoBlockSource
} from '../../../../../__generated__/globalTypes'
import { VideoUpload } from './VideoUpload'
import { CustomUrl } from './CustomUrl'

interface VideoFromUploadProps {
  onSelect: (block: VideoBlockUpdateInput) => void
}

export function VideoFromUpload({
  onSelect
}: VideoFromUploadProps): ReactElement {
  const handleChange = (id: string): void => {
    const block: VideoBlockUpdateInput = {
      videoId: id,
      source: VideoBlockSource.cloudflare,
      startAt: 0
    }
    onSelect(block)
  }

  return (
    <Stack sx={{ bgcolor: 'background.paper' }}>
      <VideoUpload onChange={handleChange} />
      <Divider sx={{ my: 4 }} />
      <CustomUrl onChange={handleChange} />
    </Stack>
  )
}
