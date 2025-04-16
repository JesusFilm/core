'use client'

import { useRouter } from 'next/navigation'
import { ReactElement } from 'react'

interface StudyQuestionsPageProps {
  params: {
    videoId: string
  }
}

export default function StudyQuestionsPage({
  params: { videoId }
}: StudyQuestionsPageProps): ReactElement {
  const router = useRouter()
  router.push(`/videos/${videoId}`)
  return <></>
}
