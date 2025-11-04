import Stack from '@mui/material/Box'
import { ReactElement } from 'react'

import {
  VideoBlockSource,
  VideoBlockUpdateInput
} from '../../../../../../../../__generated__/globalTypes'

import { AddByFile } from './AddByFile'

interface VideoFromMuxProps {
  onSelect: (block: VideoBlockUpdateInput, shouldCloseDrawer?: boolean) => void
}

export function VideoFromMux({ onSelect }: VideoFromMuxProps): ReactElement {
  const handleChange = (id: string, shouldCloseDrawer?: boolean): void => {
    const block: VideoBlockUpdateInput = {
      videoId: id,
      source: VideoBlockSource.mux,
      startAt: 0
    }
    onSelect(block, shouldCloseDrawer)
  }

  return (
    <Stack sx={{ bgcolor: 'background.paper' }} data-testid="VideoFromMux">
      <AddByFile onChange={handleChange} />
    </Stack>
  )
}
