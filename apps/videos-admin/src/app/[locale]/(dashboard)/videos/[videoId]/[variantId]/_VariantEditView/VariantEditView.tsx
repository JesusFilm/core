'use client'
import Typography from '@mui/material/Typography'
import { useParams, useSearchParams } from 'next/navigation'
import { ReactElement } from 'react'

import { useAdminVideo } from '../../../../../../../libs/useAdminVideo'

export function VariantEditView(): ReactElement {
  const params = useParams<{ videoId: string; variantId: string }>()
  const searchParams = useSearchParams()
  const languageId = searchParams?.get('language')

  const { data, loading } = useAdminVideo({
    variables: { videoId: params?.videoId as string, languageId: languageId }
  })

  const videoTitle =
    data?.adminVideo.title[0]?.value ??
    'No translated title exists in this language'

  return (
    <>
      <Typography variant="h3">{`variantId: ${params?.variantId}`}</Typography>
      <Typography variant="h4">{`videoId: ${params?.videoId}`}</Typography>
      <Typography variant="h4">{`title: ${videoTitle}`}</Typography>
    </>
  )
}
