import { useTranslations } from 'next-intl'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import { GetAdminVideoVariant } from '../../../../../../../../libs/useAdminVideo'
import { useDeleteVideoVariantMutation } from '../../../../../../../../libs/useDeleteVideoVariantMutation/useDeleteVideoVariantMutation'

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
  const t = useTranslations()
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
        enqueueSnackbar(t('Audio language deleted successfully'), {
          variant: 'success'
        })
        onClose?.()
        onSuccess?.()
      },
      onError: () => {
        enqueueSnackbar(t('Failed to delete audio language'), {
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
        title: t('Delete Audio Language'),
        closeButton: true
      }}
      dialogAction={{
        onSubmit: handleConfirm,
        submitLabel: t('Delete'),
        closeLabel: t('Cancel')
      }}
      loading={loading}
    >
      {t('deleteVariantDialog', {
        language: languageName
      })}
    </Dialog>
  )
}
