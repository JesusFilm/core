'use client'

import CircularProgress from '@mui/material/CircularProgress'
import { useRouter } from 'next/navigation'
import { ReactElement, Suspense, use } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import { CitationForm } from '../_CitationForm/CitationForm'

interface CitationEditPageProps {
  params: Promise<{
    videoId: string
    citationId: string
  }>
}

export default function CitationEditPage({
  params
}: CitationEditPageProps): ReactElement {
  const { videoId, citationId } =
    (params as any)?.then != null ? use(params as any) : (params as any)
  const router = useRouter()
  return (
    <Dialog
      open={true}
      onClose={() => router.push(`/videos/${videoId}`, { scroll: false })}
      dialogTitle={{
        title: 'Edit Bible Citation',
        closeButton: true
      }}
      divider
    >
      <Suspense fallback={<CircularProgress />}>
        <CitationForm
          videoId={videoId}
          citationId={citationId}
          variant="edit"
        />
      </Suspense>
    </Dialog>
  )
}
