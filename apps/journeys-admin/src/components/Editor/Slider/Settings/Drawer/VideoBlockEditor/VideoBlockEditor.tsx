import Box from '@mui/material/Box'
import dynamic from 'next/dynamic'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../__generated__/BlockFields'
import { VideoBlockUpdateInput } from '../../../../../../../__generated__/globalTypes'

import { Source } from './Source'

const VideoBlockEditorSettings = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/VideoBlockEditor/Settings/VideoBlockEditorSettings" */ './Settings/VideoBlockEditorSettings'
    ).then((mod) => mod.VideoBlockEditorSettings),
  { ssr: false }
)

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
      <Box sx={{ p: 4, pt: 0 }} data-testid="VideoBlockEditor">
        <Source selectedBlock={selectedBlock} onChange={onChange} />
      </Box>
      {videoBlock?.videoId != null && (
        <Box pb={4}>
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
