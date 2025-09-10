'use client'

import { useParams, useRouter } from 'next/navigation'
import { ReactElement } from 'react'

export default function VideoImage(): ReactElement {
  const router = useRouter()
  const { videoId } = useParams() as { videoId: string }
  router.push(`/videos/${videoId}`)
  return <></>
}
