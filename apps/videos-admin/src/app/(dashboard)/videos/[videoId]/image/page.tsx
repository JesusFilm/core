'use client'

import { useParams, useRouter } from 'next/navigation'
import { ReactElement } from 'react'

interface VideoImageProps {}

export default function VideoImage({}: VideoImageProps): ReactElement {
  const router = useRouter()
  const { videoId } = useParams() as { videoId: string }
  router.push(`/videos/${videoId}`)
  return <></>
}
