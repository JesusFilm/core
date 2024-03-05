import { gql, useMutation } from '@apollo/client'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { Dialog } from '@core/shared/ui/Dialog'
import Trash2Icon from '@core/shared/ui/icons/Trash2'

import { BlockDelete } from '../../../../../../../../__generated__/BlockDelete'
import { blockDeleteUpdate } from '../../../../../../../libs/blockDeleteUpdate'
import { MenuItem } from '../../../../../../MenuItem'

import getSelected from './utils/getSelected'

export const BLOCK_DELETE = gql`
  mutation BlockDelete($id: ID!, $journeyId: ID!, $parentBlockId: ID) {
    blockDelete(id: $id, journeyId: $journeyId, parentBlockId: $parentBlockId) {
      id
      parentOrder
    }
  }
`

interface DeleteBlockProps {
  variant: 'button' | 'list-item'
  closeMenu?: () => void
  disabled?: boolean
  block?: TreeBlock
}

export function DeleteBlock({
  variant = 'button',
  closeMenu,
  disabled = false,
  block
}: DeleteBlockProps): ReactElement {
  const [blockDelete] = useMutation<BlockDelete>(BLOCK_DELETE)
  const { enqueueSnackbar } = useSnackbar()
  const { journey } = useJourney()
  const {
    state: { selectedBlock: stateSelectedBlock, selectedStep, steps },
    dispatch
  } = useEditor()
  const selectedBlock = block ?? stateSelectedBlock

  const blockType = selectedBlock?.__typename === 'StepBlock' ? 'Card' : 'Block'
  const [openDialog, setOpenDialog] = useState(false)
  const handleOpenDialog = (): void => setOpenDialog(true)
  const handleCloseDialog = (): void => {
    setOpenDialog(false)
    closeMenu?.()
  }

  const disableAction = selectedBlock == null || disabled

  const handleDeleteBlock = async (): Promise<void> => {
    if (selectedBlock == null || journey == null || steps == null) return

    const deletedBlockParentOrder = selectedBlock.parentOrder
    const deletedBlockType = selectedBlock.__typename
    const stepsBeforeDelete = steps
    const stepBeforeDelete = selectedStep

    await blockDelete({
      variables: {
        id: selectedBlock.id,
        journeyId: journey.id,
        parentBlockId: selectedBlock.parentBlockId
      },
      update(cache, { data }) {
        if (
          data?.blockDelete != null &&
          deletedBlockParentOrder != null &&
          block?.id === stateSelectedBlock?.id
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

        blockDeleteUpdate(selectedBlock, data?.blockDelete, cache, journey.id)
      }
    })

    handleCloseDialog()

    deletedBlockType !== 'StepBlock'
      ? enqueueSnackbar('Block Deleted', {
          variant: 'success',
          preventDuplicate: true
        })
      : enqueueSnackbar('Card Deleted', {
          variant: 'success',
          preventDuplicate: true
        })
  }

  const { t } = useTranslation('apps-journeys-admin')

  return (
    <>
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        dialogTitle={{ title: 'Delete Card?' }}
        dialogAction={{
          onSubmit: handleDeleteBlock,
          submitLabel: 'Delete',
          closeLabel: 'Cancel'
        }}
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
          onClick={blockType === 'Card' ? handleOpenDialog : handleDeleteBlock}
        >
          <Trash2Icon />
        </IconButton>
      ) : (
        <MenuItem
          label={`Delete ${blockType}`}
          icon={<Trash2Icon />}
          disabled={disableAction}
          onClick={blockType === 'Card' ? handleOpenDialog : handleDeleteBlock}
        />
      )}
    </>
  )
}
