'use client'

import { useRouter } from 'next/navigation'

interface DeleteChildProps {
  params: {
    videoId: string
  }
}

export default function DeleteChild({ params: { videoId } }: DeleteChildProps) {
  const router = useRouter()
  router.push(`/videos/${videoId}/children`, {
    scroll: false
  })
  return <></>
}
