'use client'

import { useMutation } from '@apollo/client'
import { useRouter } from 'next/navigation'
import { enqueueSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'next-i18next'

import { graphql } from '@core/shared/gql'
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

  const { t } = useTranslation('apps-videos-admin')

  async function handleConfirm(): Promise<void> {
    setIsLoading(true)
    try {
      await deleteVideoVariantDownload({
        variables: {
          id: downloadId
        }
      })
      enqueueSnackbar(t('Download deleted'), {
        variant: 'success'
      })
      router.push(returnUrl, {
        scroll: false
      })
    } catch (error) {
      enqueueSnackbar(error.message ?? t('Failed to delete download'), {
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
        title: t('Delete Download'),
        closeButton: true
      }}
      dialogAction={{
        onSubmit: handleConfirm,
        submitLabel: t('Delete'),
        closeLabel: t('Cancel')
      }}
      loading={isLoading}
    >
      {t('Are you sure you want to delete this download?')}
    </Dialog>
  )
}
