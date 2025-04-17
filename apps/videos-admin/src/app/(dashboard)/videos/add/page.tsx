'use client'

import { useRouter } from 'next/navigation'
import { ReactElement } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import { VideoCreateForm } from '../_VideoCreateForm'

export default function AddVideoPage(): ReactElement {
  const router = useRouter()

  return (
    <Dialog
      open={true}
      onClose={() =>
        router.push('/videos', {
          scroll: false
        })
      }
      dialogTitle={{
        title: 'Create Video',
        closeButton: true
      }}
      divider
      sx={{ '& .MuiDialog-paperFullWidth': { maxWidth: 480 } }}
    >
      <VideoCreateForm />
    </Dialog>
  )
}
