'use client'

import { useVideo } from '../../../../libs/VideoProvider'

import { Metadata } from './_VideoView/Metadata'

export default function VideoPage() {
  const video = useVideo()

  return <Metadata video={video} />
}
