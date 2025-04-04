import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import { GetAdminVideoVariant } from '../../../../../../../libs/useAdminVideo'
import { useDeleteVideoVariantMutation } from '../../../../../../../libs/useDeleteVideoVariantMutation/useDeleteVideoVariantMutation'

interface DeleteVariantDialogProps {
  variant: GetAdminVideoVariant | null
  open: boolean
  onClose?: () => void
  onSuccess?: () => void
}

export function DeleteVariantDialog({
  variant,
  open,
  onClose,
  onSuccess
}: DeleteVariantDialogProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const [deleteVariantMutation, { loading }] = useDeleteVideoVariantMutation()

  const languageName =
    variant?.language.name.find(({ primary }) => primary)?.value ??
    variant?.language.name.find(({ primary }) => !primary)?.value

  const handleConfirm = async (): Promise<void> => {
    if (variant == null) return
    await deleteVariantMutation({
      variables: {
        id: variant.id
      },
      onCompleted: () => {
        enqueueSnackbar('Audio language deleted successfully', {
          variant: 'success'
        })
        onClose?.()
        onSuccess?.()
      },
      onError: () => {
        enqueueSnackbar('Failed to delete audio language', {
          variant: 'error'
        })
      }
    })
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      dialogTitle={{
        title: 'Delete Audio Language',
        closeButton: true
      }}
      dialogAction={{
        onSubmit: handleConfirm,
        submitLabel: 'Delete',
        closeLabel: 'Cancel'
      }}
      loading={loading}
    >
      {`Are you sure you want to delete the ${languageName} audio language? This action cannot be undone.`}
    </Dialog>
  )
}
