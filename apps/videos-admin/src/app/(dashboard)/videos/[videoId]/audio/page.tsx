'use client'

import { useVideo } from '../../../../../libs/VideoProvider'
import { Variants } from '../_VideoView/Variants'

export default function AudioLanguagesPage() {
  const video = useVideo()

  return <Variants variants={video.variants} editions={video.videoEditions} />
}
