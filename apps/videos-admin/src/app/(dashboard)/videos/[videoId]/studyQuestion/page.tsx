'use client'

import { useRouter } from 'next/navigation'
import { use } from 'react'
import { ReactElement } from 'react'

interface StudyQuestionsPageProps {
  params: Promise<{ videoId: string }>
}

export default function StudyQuestionsPage({ params }: StudyQuestionsPageProps): ReactElement {
  const router = useRouter()
  const { videoId } = use(params)
  router.push(`/videos/${videoId}`)
  return <></>
}
