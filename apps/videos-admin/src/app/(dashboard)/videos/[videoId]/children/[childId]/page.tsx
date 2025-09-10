'use client'

import { useParams, useRouter } from 'next/navigation'

interface DeleteChildProps {}

export default function DeleteChild({}: DeleteChildProps) {
  const router = useRouter()
  const { videoId } = useParams() as { videoId: string }
  router.push(`/videos/${videoId}/children`, {
    scroll: false
  })
  return <></>
}
