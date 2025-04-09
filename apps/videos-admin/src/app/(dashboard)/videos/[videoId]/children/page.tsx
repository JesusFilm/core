'use client'

import { useVideo } from '../../../../../libs/VideoProvider'
import { VideoChildren } from '../_VideoView/VideoChildren'
import { getVideoChildrenLabel } from '../_VideoView/VideoChildren/getVideoChildrenLabel'

export default function ChildrenPage() {
  const video = useVideo()

  const videoLabel = getVideoChildrenLabel(video.label)

  if (!videoLabel) return null

  return (
    <VideoChildren
      videoId={video.id ?? ''}
      childVideos={video.children ?? []}
      label={videoLabel}
    />
  )
}
