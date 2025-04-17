'use client'

import { useMutation } from '@apollo/client'
import { graphql } from 'gql.tada'
import { useRouter } from 'next/navigation'
import { enqueueSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

interface ConfirmDeleteDialogProps {
  params: {
    videoId: string
    variantId: string
    downloadId: string
  }
}

const VIDEO_VARIANT_DOWNLOAD_DELETE = graphql(`
  mutation VideoVariantDownloadDelete($id: ID!) {
    videoVariantDownloadDelete(id: $id) {
      id
    }
  }
`)

export default function ConfirmDeleteDialog({
  params: { videoId, variantId, downloadId }
}: ConfirmDeleteDialogProps): ReactElement {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [deleteVideoVariantDownload] = useMutation(
    VIDEO_VARIANT_DOWNLOAD_DELETE
  )
  const returnUrl = `/videos/${videoId}/audio/${variantId}`

  async function handleConfirm(): Promise<void> {
    setIsLoading(true)
    try {
      await deleteVideoVariantDownload({
        variables: {
          id: downloadId
        }
      })
      enqueueSnackbar('Download deleted', {
        variant: 'success'
      })
      router.push(returnUrl, {
        scroll: false
      })
    } catch (error) {
      enqueueSnackbar(error.message ?? 'Failed to delete download', {
        variant: 'error'
      })
      setIsLoading(false)
    }
  }

  return (
    <Dialog
      open={true}
      onClose={() =>
        router.push(returnUrl, {
          scroll: false
        })
      }
      dialogTitle={{
        title: 'Delete Download',
        closeButton: true
      }}
      dialogAction={{
        onSubmit: handleConfirm,
        submitLabel: 'Delete',
        closeLabel: 'Cancel'
      }}
      loading={isLoading}
    >
      Are you sure you want to delete this download?
    </Dialog>
  )
}
