'use client'

import { useRouter } from 'next/navigation'
import { ReactElement, use } from 'react'

type DownloadPageProps = {
  params:
     Promise<{
        videoId: string
        variantId: string
      }>
}

export default function DownloadPage({
  params
}: DownloadPageProps): ReactElement {
  const { videoId, variantId } =
    use(params)
  const router = useRouter()
  router.push(`/videos/${videoId}/audio/${variantId}`, {
    scroll: false
  })

  return <></>
}
