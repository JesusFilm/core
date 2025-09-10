'use client'

import { useParams, useRouter } from 'next/navigation'
import { ReactElement } from 'react'

interface StudyQuestionsPageProps {}

export default function StudyQuestionsPage({}: StudyQuestionsPageProps): ReactElement {
  const router = useRouter()
  const { videoId } = useParams() as { videoId: string }
  router.push(`/videos/${videoId}`)
  return <></>
}
