'use client'

import { VideoChildren } from './VideoChildren'
import { getVideoChildrenLabel } from './VideoChildren/getVideoChildrenLabel'

export default function ChildrenPage() {
  const videoLabel = getVideoChildrenLabel(video.label)

  if (!videoLabel) return null

  return (
    <></>
    // <VideoChildren
    //   videoId={video.id ?? ''}
    //   childVideos={video.children ?? []}
    //   label={videoLabel}
    // />
  )
}
