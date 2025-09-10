'use client'

import CircularProgress from '@mui/material/CircularProgress'
import { useParams, useRouter } from 'next/navigation'
import { ReactElement, Suspense } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import { CitationForm } from '../_CitationForm/CitationForm'

interface AddBibleCitationProps {}

export default function AddBibleCitation({}: AddBibleCitationProps): ReactElement {
  const router = useRouter()
  const { videoId } = useParams() as { videoId: string }
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
