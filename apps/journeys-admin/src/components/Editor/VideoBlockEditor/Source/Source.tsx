import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import Stack from '@mui/material/Stack'
import { ReactElement, useState } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'

import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../__generated__/GetJourney'
import {
  VideoBlockSource,
  VideoBlockUpdateInput
} from '../../../../../__generated__/globalTypes'
import { VideoLibrary } from '../../VideoLibrary'

import { SourceEmpty } from './SourceEmpty'
import { SourceFromCloudflare } from './SourceFromCloudflare'
import { SourceFromLocal } from './SourceFromLocal'
import { SourceFromYouTube } from './SourceFromYouTube'

interface SourceProps {
  selectedBlock: TreeBlock<VideoBlock> | null
  onChange: (block: VideoBlockUpdateInput) => Promise<void>
}

export function Source({ selectedBlock, onChange }: SourceProps): ReactElement {
  const [open, setOpen] = useState(false)

  let SourceContent

  switch (selectedBlock?.source) {
    case VideoBlockSource.internal:
      if (selectedBlock.videoId != null) {
        SourceContent = SourceFromLocal
      } else {
        SourceContent = SourceEmpty
      }
      break
    case VideoBlockSource.youTube:
      SourceContent = SourceFromYouTube
      break
    case VideoBlockSource.cloudflare:
      SourceContent = SourceFromCloudflare
      break
    default:
      SourceContent = SourceEmpty
      break
  }

  return (
    <>
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardActionArea onClick={() => setOpen(true)}>
          <Stack direction="row" alignItems="center" spacing={3} sx={{ p: 2 }}>
            <SourceContent selectedBlock={selectedBlock} />
          </Stack>
        </CardActionArea>
      </Card>
      <VideoLibrary
        open={open}
        onClose={() => setOpen(false)}
        selectedBlock={selectedBlock}
        onSelect={onChange}
      />
    </>
  )
}
