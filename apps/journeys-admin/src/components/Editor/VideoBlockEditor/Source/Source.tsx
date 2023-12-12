import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import Stack from '@mui/material/Stack'
import dynamic from 'next/dynamic'
import { ReactElement, useState } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'

import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../__generated__/GetJourney'
import {
  VideoBlockSource,
  VideoBlockUpdateInput
} from '../../../../../__generated__/globalTypes'

const VideoLibrary = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "VideoLibrary" */ '../../VideoLibrary'
    ).then((mod) => mod.VideoLibrary)
)

const SourceFromYouTube = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "SourceFromYouTube" */ './SourceFromYouTube'
    ).then((mod) => mod.SourceFromYouTube)
)

const SourceEmpty = dynamic(
  async () =>
    await import(/* webpackChunkName: "SourceEmpty" */ './SourceEmpty').then(
      (mod) => mod.SourceEmpty
    )
)

const SourceFromCloudflare = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "SourceFromCloudflare" */ './SourceFromCloudflare'
    ).then((mod) => mod.SourceFromCloudflare)
)

const SourceFromLocal = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "SourceFromLocal" */ './SourceFromLocal'
    ).then((mod) => mod.SourceFromLocal)
)

interface SourceProps {
  selectedBlock: TreeBlock<VideoBlock> | null
  onChange: (block: VideoBlockUpdateInput) => Promise<void>
}

export function Source({ selectedBlock, onChange }: SourceProps): ReactElement {
  const [open, setOpen] = useState<boolean | undefined>()

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
        <CardActionArea
          onClick={() => {
            setOpen(true)
          }}
        >
          <Stack direction="row" alignItems="center" spacing={3} sx={{ p: 2 }}>
            <SourceContent selectedBlock={selectedBlock} />
          </Stack>
        </CardActionArea>
      </Card>
      {open != null && (
        <VideoLibrary
          open={open}
          onClose={() => setOpen(false)}
          selectedBlock={selectedBlock}
          onSelect={onChange}
        />
      )}
    </>
  )
}
