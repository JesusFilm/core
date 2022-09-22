import { ReactElement, useState } from 'react'
import type { TreeBlock } from '@core/journeys/ui/block'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import Stack from '@mui/material/Stack'
import {
  VideoBlockSource,
  VideoBlockUpdateInput
} from '../../../../../__generated__/globalTypes'
import { VideoLibrary } from '../../VideoLibrary'
import { VideoDetails } from '../../VideoLibrary/VideoDetails'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../__generated__/GetJourney'
import { SourceFromYouTube } from './SourceFromYouTube'
import { SourceEmpty } from './SourceEmpty'
import { SourceFromLocal } from './SourceFromLocal'

interface SourceProps {
  open?: boolean
  selectedBlock: TreeBlock<VideoBlock> | null
  onChange: (block: VideoBlockUpdateInput) => Promise<void>
}

export function Source({
  open: openLibrary,
  selectedBlock,
  onChange
}: SourceProps): ReactElement {
  const [openVideoLibrary, setOpenVideoLibrary] = useState(openLibrary ?? false)
  const [openVideoDetails, setOpenVideoDetails] = useState(false)

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
    default:
      SourceContent = SourceEmpty
      break
  }

  return (
    <>
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardActionArea
          onClick={() =>
            selectedBlock?.videoId == null
              ? setOpenVideoLibrary(true)
              : setOpenVideoDetails(true)
          }
        >
          <Stack direction="row" alignItems="center" spacing={3} sx={{ p: 2 }}>
            <SourceContent selectedBlock={selectedBlock} />
          </Stack>
        </CardActionArea>
      </Card>
      {selectedBlock?.videoId == null && (
        <VideoLibrary
          open={openVideoLibrary}
          onClose={() => setOpenVideoLibrary(false)}
          onSelect={onChange}
        />
      )}
      {selectedBlock?.videoId != null && (
        <VideoDetails
          id={selectedBlock.videoId}
          open={openVideoDetails}
          source={selectedBlock?.source}
          onClose={() => setOpenVideoDetails(false)}
          onSelect={onChange}
        />
      )}
    </>
  )
}
