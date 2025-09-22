'use client'

import { useRouter } from 'next/navigation'
import { ReactElement, use } from 'react'

interface VideoImageProps {
  params: Promise<{ videoId: string }>
}

export default function VideoImage({ params }: VideoImageProps): ReactElement {
  const router = useRouter()
  const { videoId } = use(params)
  router.push(`/videos/${videoId}`)
  return <></>
}
