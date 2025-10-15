'use client'

import { useRouter } from 'next/navigation'
import { use } from 'react'

interface DeleteChildProps {
  params: Promise<{ videoId: string; childId: string }>
}

export default function DeleteChild({ params }: DeleteChildProps) {
  const router = useRouter()
  const { videoId } = use(params)
  router.push(`/videos/${videoId}/children`, {
    scroll: false
  })
  return <></>
}
