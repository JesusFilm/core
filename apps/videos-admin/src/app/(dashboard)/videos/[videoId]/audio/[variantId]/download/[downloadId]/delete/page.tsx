'use client'

import { useMutation } from '@apollo/client'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { graphql } from 'gql.tada'
import { useRouter } from 'next/navigation'
import { enqueueSnackbar } from 'notistack'
import { ReactElement } from 'react'

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
  const [deleteVideoVariantDownload] = useMutation(
    VIDEO_VARIANT_DOWNLOAD_DELETE
  )
  const returnUrl = `/videos/${videoId}/audio/${variantId}/downloads`
  async function handleConfirm(): Promise<void> {
    await deleteVideoVariantDownload({
      variables: {
        id: downloadId
      },
      onCompleted: () => {
        enqueueSnackbar('Download deleted', {
          variant: 'success'
        })
        router.push(returnUrl, {
          scroll: false
        })
      }
    })
  }
  return (
    <Dialog
      open={true}
      onClose={() =>
        router.push(returnUrl, {
          scroll: false
        })
      }
      aria-labelledby="confirm-delete-dialog-title"
    >
      <DialogTitle id="confirm-delete-dialog-title">
        Delete Download
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this download?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() =>
            router.push(returnUrl, {
              scroll: false
            })
          }
          color="primary"
        >
          Cancel
        </Button>
        <Button onClick={handleConfirm} color="error" autoFocus>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  )
}
