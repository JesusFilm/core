'use client'

import CircularProgress from '@mui/material/CircularProgress'
import { useRouter } from 'next/navigation'
import { ReactElement, Suspense } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import { CitationForm } from '../_CitationForm/CitationForm'

interface AddBibleCitationProps {
  params: {
    videoId: string
  }
}

export default function AddBibleCitation({
  params: { videoId }
}: AddBibleCitationProps): ReactElement {
  const router = useRouter()
  return (
    <Dialog
      open={true}
      onClose={() => router.push(`/videos/${videoId}`, { scroll: false })}
      dialogTitle={{
        title: 'Add Bible Citation',
        closeButton: true
      }}
      divider
    >
      <Suspense fallback={<CircularProgress />}>
        <CitationForm videoId={videoId} variant="create" />
      </Suspense>
    </Dialog>
  )
}
