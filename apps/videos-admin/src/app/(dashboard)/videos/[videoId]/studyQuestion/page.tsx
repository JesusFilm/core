'use client'

import { useParams, useRouter } from 'next/navigation'
import { ReactElement } from 'react'

export default function StudyQuestionsPage(): ReactElement {
  const router = useRouter()
  const { videoId } = useParams<{ videoId: string }>()
  router.push(`/videos/${videoId}`)
  return <></>
}
