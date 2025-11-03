'use client'

import { useRouter } from 'next/navigation'
import { ReactElement } from 'react'

type DownloadPageProps = {
  params: {
    videoId: string
    variantId: string
  }
}

export default function DownloadPage({
  params
}: DownloadPageProps): ReactElement {
  const router = useRouter()
  router.push(`/videos/${params.videoId}/audio/${params.variantId}`, {
    scroll: false
  })

  return <></>
}
