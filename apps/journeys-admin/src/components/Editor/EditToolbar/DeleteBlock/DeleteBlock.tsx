import { gql, useMutation } from '@apollo/client'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { Dialog } from '@core/shared/ui/Dialog'
import Trash2 from '@core/shared/ui/icons/Trash2'

import { BlockDelete } from '../../../../../__generated__/BlockDelete'
import { blockDeleteUpdate } from '../../../../libs/blockDeleteUpdate/blockDeleteUpdate'
import { MenuItem } from '../../../MenuItem'

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
}

export function DeleteBlock({
  variant = 'button',
  closeMenu,
  disabled = false
}: DeleteBlockProps): ReactElement {
  const [blockDelete] = useMutation<BlockDelete>(BLOCK_DELETE)
  const { enqueueSnackbar } = useSnackbar()

  const { journey } = useJourney()
  const {
    state: { selectedBlock, selectedStep, steps },
    dispatch
  } = useEditor()

  const label = selectedBlock?.__typename === 'StepBlock' ? 'Card' : 'Block'
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
        if (data?.blockDelete != null && deletedBlockParentOrder != null) {
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
          Are you sure you would like to delete this card?
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
          onClick={label === 'Card' ? handleOpenDialog : handleDeleteBlock}
        >
          <Trash2 />
        </IconButton>
      ) : (
        <MenuItem
          label={`Delete ${label}`}
          icon={<Trash2 />}
          disabled={disableAction}
          onClick={label === 'Card' ? handleOpenDialog : handleDeleteBlock}
        />
      )}
    </>
  )
}
