import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import Stack from '@mui/material/Stack'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { ReactElement, useEffect, useState } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'

import { BlockFields_VideoBlock as VideoBlock } from '../../../../../../../../__generated__/BlockFields'
import {
  VideoBlockSource,
  VideoBlockUpdateInput
} from '../../../../../../../../__generated__/globalTypes'
import { setBeaconPageViewed } from '../../../../../../../libs/setBeaconPageViewed'

const VideoLibrary = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/VideoLibrary/VideoLibrary" */ '../../VideoLibrary'
    ).then((mod) => mod.VideoLibrary),
  { ssr: false }
)

const SourceFromYouTube = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/VideoBlockEditor/Source/SourceFromYouTube/SourceFromYouTube" */ './SourceFromYouTube'
    ).then((mod) => mod.SourceFromYouTube),
  { ssr: false }
)

const SourceEmpty = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/VideoBlockEditor/Source/SourceEmpty/SourceEmpty" */ './SourceEmpty'
    ).then((mod) => mod.SourceEmpty),
  { ssr: false }
)

const SourceFromCloudflare = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/VideoBlockEditor/Source/SourceFromCloudflare/SourceFromCloudflare" */ './SourceFromCloudflare'
    ).then((mod) => mod.SourceFromCloudflare),
  { ssr: false }
)

const SourceFromLocal = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/VideoBlockEditor/Source/SourceFromLocal/SourceFromLocal" */ './SourceFromLocal'
    ).then((mod) => mod.SourceFromLocal),
  { ssr: false }
)

interface SourceProps {
  selectedBlock: TreeBlock<VideoBlock> | null
  onChange: (block: VideoBlockUpdateInput) => Promise<void>
}

export function Source({ selectedBlock, onChange }: SourceProps): ReactElement {
  const router = useRouter()
  const [open, setOpen] = useState<boolean | undefined>()
  const {
    state: { selectedAttributeId }
  } = useEditor()

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

  function handleClick(): void {
    setOpen(true)
    const param = 'video-library'
    void router.push({ query: { ...router.query, param } }, undefined, {
      shallow: true
    })
    router.events.on('routeChangeComplete', () => {
      setBeaconPageViewed(param)
    })
  }

  useEffect(() => {
    if (selectedAttributeId === undefined && open === true) {
      setOpen(false)
    }
  }, [selectedAttributeId, open])

  return (
    <>
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardActionArea onClick={handleClick}>
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
