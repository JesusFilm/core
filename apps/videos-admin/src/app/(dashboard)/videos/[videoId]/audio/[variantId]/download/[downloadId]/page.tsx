'use client'

import { useRouter } from 'next/navigation'
import { ReactElement, use, useEffect } from 'react'

type DownloadPageProps = {
  params: Promise<{
    videoId: string
    variantId: string
  }>
}

export default function DownloadPage({
  params: paramsPromise
}: DownloadPageProps): ReactElement {
  const params = use(paramsPromise)
  const router = useRouter()

  useEffect(() => {
    router.push(`/videos/${params.videoId}/audio/${params.variantId}`, {
      scroll: false
    })
  }, [router, params.videoId, params.variantId])

  return <></>
}
