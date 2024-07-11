import IconButton from '@mui/material/IconButton'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import Trash2Icon from '@core/shared/ui/icons/Trash2'

import { MenuItem } from '../../../../../../MenuItem'

import { DeleteDialog } from './DeleteDialog'
import useBlockDelete from './utils/useBlockDelete'

interface DeleteBlockProps {
  variant: 'button' | 'list-item'
  closeMenu?: () => void
  disabled?: boolean
}

export function DeleteBlock({
  variant = 'button',
  closeMenu,
  disabled = false
}: DeleteBlockProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const [openDialog, setOpenDialog] = useState(false)
  const { loading, onDeleteBlock, selectedBlock } = useBlockDelete()
  const blockType = selectedBlock?.__typename === 'StepBlock' ? 'Card' : 'Block'

  const handleOpenDialog = (): void => setOpenDialog(true)
  const handleCloseDialog = (): void => {
    setOpenDialog(false)
    closeMenu?.()
  }

  async function handleDeleteBlock() {
    await onDeleteBlock()
    handleCloseDialog()
  }

  const disableAction = selectedBlock == null || disabled || loading

  return (
    <>
      <DeleteDialog
        openDialog={openDialog}
        handleCloseDialog={handleCloseDialog}
        handleDeleteBlock={handleDeleteBlock}
        loading={loading}
      />

      {variant === 'button' ? (
        <IconButton
          id="delete-block-actions"
          aria-label="Delete Block Actions"
          aria-controls="delete-block-actions"
          aria-haspopup="true"
          aria-expanded="true"
          disabled={disableAction}
          onMouseUp={
            blockType === 'Card' ? handleOpenDialog : handleDeleteBlock
          }
        >
          <Trash2Icon />
        </IconButton>
      ) : (
        <MenuItem
          label={t('Delete {{ label }}', {
            label: blockType === 'Card' ? t('Card') : t('Block')
          })}
          icon={<Trash2Icon />}
          disabled={disableAction}
          onMouseUp={
            blockType === 'Card' ? handleOpenDialog : handleDeleteBlock
          }
        />
      )}
    </>
  )
}
