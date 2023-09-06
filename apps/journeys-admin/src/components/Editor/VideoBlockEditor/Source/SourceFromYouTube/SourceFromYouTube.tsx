import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded' // icon-replace: add video-on
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import Edit2 from '@core/shared/ui/icons/Edit2'

import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../../__generated__/GetJourney'
import { ImageBlockThumbnail } from '../../../ImageBlockThumbnail'

interface SourceFromYouTubeProps {
  selectedBlock: TreeBlock<VideoBlock>
}

export function SourceFromYouTube({
  selectedBlock
}: SourceFromYouTubeProps): ReactElement {
  return (
    <>
      <Box>
        <ImageBlockThumbnail
          selectedBlock={{
            src: selectedBlock.image ?? '',
            alt: selectedBlock.title ?? ''
          }}
          Icon={VideocamRoundedIcon}
        />
      </Box>
      <Box flexGrow={1} minWidth={0}>
        <Typography
          variant="subtitle2"
          sx={{
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden'
          }}
        >
          {selectedBlock.title}
        </Typography>

        <Typography
          variant="caption"
          sx={{
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden'
          }}
        >
          YouTube &nbsp;
        </Typography>
      </Box>
      <Edit2 color="primary" />
    </>
  )
}
