import Stack from '@mui/material/Box'
import { ReactElement } from 'react'

import {
  VideoBlockSource,
  VideoBlockUpdateInput
} from '../../../../../__generated__/globalTypes'

import { AddByFile } from './AddByFile'

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
    </Stack>
  )
}
