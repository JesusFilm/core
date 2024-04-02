import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { FC } from 'react'

import { Modal } from '../Modal'

interface DeleteModalProps {
  content: string
  open: boolean
  onClose: () => void
  onDelete: () => void
}

export const DeleteModal: FC<DeleteModalProps> = ({
  content,
  open,
  onClose,
  onDelete
}) => {
  const { t } = useTranslation()

  return (
    <Modal
      title="Delete"
      open={open}
      handleClose={onClose}
      actions={
        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button onClick={onClose}>{t('Cancel')}</Button>
          <Button onClick={onDelete}>{t('Delete')}</Button>
        </Stack>
      }
    >
      <Typography>{content}</Typography>
    </Modal>
  )
}
