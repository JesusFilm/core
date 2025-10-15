'use client'

import { useMutation } from '@apollo/client'
import { useRouter } from 'next/navigation'
import { enqueueSnackbar } from 'notistack'
import { ReactElement, use, useState } from 'react'

import { graphql } from '@core/shared/gql'
import { Dialog } from '@core/shared/ui/Dialog'

interface ConfirmDeleteDialogProps {
  params:
    | Promise<{ videoId: string; variantId: string; downloadId: string }>
    | { videoId: string; variantId: string; downloadId: string }
}

const VIDEO_VARIANT_DOWNLOAD_DELETE = graphql(`
  mutation VideoVariantDownloadDelete($id: ID!) {
    videoVariantDownloadDelete(id: $id) {
      id
    }
  }
`)

export default function ConfirmDeleteDialog({
  params
}: ConfirmDeleteDialogProps): ReactElement {
  const { videoId, variantId, downloadId } =
    (params as any)?.then != null ? use(params as any) : (params as any)
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
