import { ReactElement } from 'react'
import { TreeBlock } from '@core/journeys/ui'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import { VideoBlockUpdateInput } from '../../../../__generated__/globalTypes'
import {
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../__generated__/GetJourney'
import { ImageBlockHeader } from '../ImageBlockHeader'
import { Source } from './Source'
import { VideoBlockEditorSettings } from './Settings'

interface VideoBlockEditorProps {
  selectedBlock: TreeBlock<VideoBlock> | null
  onChange: (input: VideoBlockUpdateInput) => Promise<void>
  showDelete?: boolean
  onDelete?: () => Promise<void>
}

export function VideoBlockEditor({
  selectedBlock,
  showDelete = true,
  onChange,
  onDelete
}: VideoBlockEditorProps): ReactElement {
  const posterBlock = selectedBlock?.children.find(
    (child) => child.id === (selectedBlock as VideoBlock).posterBlockId
  ) as ImageBlock | null

  const handleVideoDelete = async (): Promise<void> => {
    await onDelete?.()
  }

  return (
    <>
      <ImageBlockHeader
        selectedBlock={posterBlock}
        header={
          selectedBlock?.video?.variant?.hls == null
            ? 'Select Video File'
            : selectedBlock.video.variant.hls
        }
        showDelete={showDelete && selectedBlock?.video != null}
        onDelete={handleVideoDelete}
      />
      <Box>
        <Source onChange={onChange} />
        <Divider />
        <VideoBlockEditorSettings
          selectedBlock={selectedBlock}
          posterBlock={posterBlock}
          onChange={onChange}
        />
      </Box>
    </>
  )
}
