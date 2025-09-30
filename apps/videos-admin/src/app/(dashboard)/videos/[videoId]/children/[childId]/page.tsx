'use client'

import { useParams, useRouter } from 'next/navigation'

export default function DeleteChild() {
  const router = useRouter()
  const { videoId } = useParams<{ videoId: string }>()
  router.push(`/videos/${videoId}/children`, {
    scroll: false
  })
  return <></>
}
