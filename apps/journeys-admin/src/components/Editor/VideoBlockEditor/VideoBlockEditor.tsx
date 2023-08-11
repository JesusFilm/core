import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'

import {
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../__generated__/GetJourney'
import { VideoBlockUpdateInput } from '../../../../__generated__/globalTypes'

import { VideoBlockEditorSettings } from './Settings'
import { Source } from './Source'

interface VideoBlockEditorProps {
  selectedBlock: TreeBlock<VideoBlock> | null
  onChange: (input: VideoBlockUpdateInput) => Promise<void>
}

export function VideoBlockEditor({
  selectedBlock,
  onChange
}: VideoBlockEditorProps): ReactElement {
  const posterBlock = selectedBlock?.children.find(
    (child) => child.id === (selectedBlock as VideoBlock).posterBlockId
  ) as ImageBlock | null

  const videoBlock = selectedBlock as VideoBlock

  return (
    <>
      <Box sx={{ px: 6, py: videoBlock?.videoId != null ? 6 : 4 }}>
        <Source selectedBlock={selectedBlock} onChange={onChange} />
      </Box>
      {videoBlock?.videoId != null && (
        <Box>
          <VideoBlockEditorSettings
            selectedBlock={selectedBlock}
            posterBlock={posterBlock}
            onChange={onChange}
          />
        </Box>
      )}
    </>
  )
}
