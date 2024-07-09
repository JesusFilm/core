import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { ActiveFab, useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { TreeBlock } from '@core/journeys/ui/block'
import { Dialog } from '@core/shared/ui/Dialog'
import Trash2Icon from '@core/shared/ui/icons/Trash2'

import { blockDeleteUpdate } from '../../../../../../../libs/blockDeleteUpdate'
import { useBlockDeleteMutation } from '../../../../../../../libs/useBlockDeleteMutation'
import { MenuItem } from '../../../../../../MenuItem'

import getSelected from './utils/getSelected'

interface DeleteBlockProps {
  variant: 'button' | 'list-item' | 'journeyFlow'
  closeMenu?: () => void
  disabled?: boolean
  block?: TreeBlock
  openDeleteDialog?: boolean
  setOpenDeleteDialog?: (open: boolean) => void
}

export function DeleteBlock({
  variant = 'button',
  closeMenu,
  disabled = false,
  block,
  openDeleteDialog,
  setOpenDeleteDialog
}: DeleteBlockProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [blockDelete, result] = useBlockDeleteMutation()

  const { enqueueSnackbar } = useSnackbar()
  const { journey } = useJourney()
  const {
    state: { selectedBlock, selectedStep, steps },
    dispatch
  } = useEditor()
  const currentBlock = block ?? selectedBlock

  const blockType = currentBlock?.__typename === 'StepBlock' ? 'Card' : 'Block'
  const [openDialog, setOpenDialog] = useState(false)
  const handleOpenDialog = (): void => setOpenDialog(true)
  const handleCloseDialog = (): void => {
    setOpenDialog(false)
    setOpenDeleteDialog?.(false)
    closeMenu?.()
  }

  const disableAction = currentBlock == null || disabled || result.loading

  const handleDeleteBlock = async (): Promise<void> => {
    if (currentBlock == null || journey == null || steps == null) return

    const deletedBlockParentOrder = currentBlock.parentOrder
    const deletedBlockType = currentBlock.__typename
    const stepsBeforeDelete = steps
    const stepBeforeDelete = selectedStep

    await blockDelete(currentBlock, {
      update(cache, { data }) {
        if (
          data?.blockDelete != null &&
          deletedBlockParentOrder != null &&
          (block == null || block?.id === selectedBlock?.id)
        ) {
          const selected = getSelected({
            parentOrder: deletedBlockParentOrder,
            siblings: data.blockDelete,
            type: deletedBlockType,
            steps: stepsBeforeDelete,
            selectedStep: stepBeforeDelete
          })
          selected != null && dispatch(selected)
        }
        blockDeleteUpdate(currentBlock, data?.blockDelete, cache, journey.id)
      }
    }).then(() => {
      dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Add })
    })

    handleCloseDialog()

    deletedBlockType !== 'StepBlock'
      ? enqueueSnackbar(t('Block Deleted'), {
          variant: 'success',
          preventDuplicate: true
        })
      : enqueueSnackbar(t('Card Deleted'), {
          variant: 'success',
          preventDuplicate: true
        })
  }

  return (
    <>
      <Dialog
        open={openDeleteDialog ?? openDialog}
        onClose={handleCloseDialog}
        dialogTitle={{ title: t('Delete Card?') }}
        dialogAction={{
          onSubmit: handleDeleteBlock,
          submitLabel: t('Delete'),
          closeLabel: t('Cancel')
        }}
        loading={result.loading}
      >
        <Typography>
          {t('Are you sure you would like to delete this card?')}
        </Typography>
      </Dialog>
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
      ) : variant === 'list-item' ? (
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
      ) : null}
    </>
  )
}
