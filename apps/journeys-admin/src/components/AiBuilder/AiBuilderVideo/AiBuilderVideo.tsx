import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import type { WrapperProps } from '@core/journeys/ui/BlockRenderer'
import { Video } from '@core/journeys/ui/Video'

import type { BlockFields_VideoBlock } from '../../../../__generated__/BlockFields'

/** Use the viewer's full-screen player, without analytics or card navigation. */
export function AiBuilderVideo({
  block
}: Pick<WrapperProps<BlockFields_VideoBlock>, 'block'>): ReactElement {
  return (
    <Box data-ai-preview-video sx={{ position: 'absolute', inset: 0 }}>
      <Video
        key={`${block.id}:${block.videoId}:${block.startAt}:${block.endAt}:${block.objectFit}`}
        {...block}
        preview
        autoplay={false}
        action={null}
        reapplyServerSource
      />
    </Box>
  )
}
