'use client'

import { useRouter } from 'next/navigation'
import { ReactElement } from 'react'

interface VideoImageProps {
  params: {
    videoId: string
  }
}

export default function VideoImage({
  params: { videoId }
}: VideoImageProps): ReactElement {
  const router = useRouter()
  router.push(`/videos/${videoId}`)
  return <></>
}
