import { ReactElement, useEffect, useState } from 'react'
import type { TreeBlock } from '@core/journeys/ui/block'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import Stack from '@mui/material/Stack'
import {
  VideoBlockSource,
  VideoBlockUpdateInput
} from '../../../../../__generated__/globalTypes'
import { VideoLibrary } from '../../VideoLibrary'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../__generated__/GetJourney'
import { SourceFromYouTube } from './SourceFromYouTube'
import { SourceEmpty } from './SourceEmpty'
import { SourceFromLocal } from './SourceFromLocal'

interface SourceProps {
  selectedBlock: TreeBlock<VideoBlock> | null
  onChange: (block: VideoBlockUpdateInput) => Promise<void>
}

export function Source({ selectedBlock, onChange }: SourceProps): ReactElement {
  const [open, setOpen] = useState(false)
  const [openVideoDetails, setOpenVideoDetails] = useState(false)

  useEffect(() => {
    // opens the video library if videoId is null
    if (selectedBlock?.videoId == null) {
      setOpen(true)
    }
  }, [selectedBlock])

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
          onClick={() => {
            setOpen(true)
            // opens video details if videoId is not null
            if (selectedBlock?.videoId != null) {
              setOpenVideoDetails(true)
            }
          }}
        >
          <Stack direction="row" alignItems="center" spacing={3} sx={{ p: 2 }}>
            <SourceContent selectedBlock={selectedBlock} />
          </Stack>
        </CardActionArea>
      </Card>
      <VideoLibrary
        open={open}
        onClose={() => setOpen(false)}
        openVideoDetails={openVideoDetails}
        setOpenVideoDetails={(closeParent: boolean) =>
          setOpenVideoDetails(closeParent)
        }
        selectedBlock={selectedBlock}
        onSelect={onChange}
      />
    </>
  )
}
