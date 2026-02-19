import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import dynamic from 'next/dynamic'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useFlags } from '@core/shared/ui/FlagsProvider'

import {
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../__generated__/BlockFields'
import { VideoBlockUpdateInput } from '../../../../../../../__generated__/globalTypes'
import { BlockCustomizationToggle } from '../../CanvasDetails/Properties/controls/BlockCustomizationToggle'

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
  onChange: (
    input: VideoBlockUpdateInput,
    shouldFocus?: boolean
  ) => Promise<void>
}

export function VideoBlockEditor({
  selectedBlock,
  onChange
}: VideoBlockEditorProps): ReactElement {
  const { customizableMedia } = useFlags()
  const { journey } = useJourney()
  const posterBlock = selectedBlock?.children.find(
    (child) => child.id === (selectedBlock as VideoBlock).posterBlockId
  ) as ImageBlock | null

  const videoBlock = selectedBlock as VideoBlock

  return (
    <>
      <Stack sx={{ p: 4, pt: 0 }} gap={4} data-testid="VideoBlockEditor">
        <Source
          key={selectedBlock?.videoId}
          selectedBlock={selectedBlock}
          onChange={onChange}
        />
        {journey?.template && (customizableMedia ?? false) && (
          <BlockCustomizationToggle
            block={selectedBlock ?? undefined}
            mediaTypeWhenEmpty="video"
          />
        )}
      </Stack>

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
