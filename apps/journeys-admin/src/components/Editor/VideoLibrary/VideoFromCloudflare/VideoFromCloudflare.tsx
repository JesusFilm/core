import { ReactElement } from 'react'
import Stack from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import {
  VideoBlockUpdateInput,
  VideoBlockSource
} from '../../../../../__generated__/globalTypes'
import { AddByFile } from './AddByFile'
import { AddByUrl } from './AddByUrl'

interface VideoFromCloudflareProps {
  onSelect: (block: VideoBlockUpdateInput) => void
}

export function VideoFromCloudflare({
  onSelect
}: VideoFromCloudflareProps): ReactElement {
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
      <AddByFile onChange={handleChange} />
      <Divider sx={{ my: 4 }} />
      <AddByUrl onChange={handleChange} />
    </Stack>
  )
}
