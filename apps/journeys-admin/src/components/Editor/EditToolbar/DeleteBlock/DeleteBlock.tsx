import { ReactElement, useState } from 'react'
import IconButton from '@mui/material/IconButton'
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded'
import { gql, useMutation } from '@apollo/client'
import { useEditor } from '@core/journeys/ui'
import MenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import { useSnackbar } from 'notistack'
import Typography from '@mui/material/Typography'
import { BlockDelete } from '../../../../../__generated__/BlockDelete'
import { useJourney } from '../../../../libs/context'
import { blockDeleteUpdate } from '../../../../libs/blockDeleteUpdate/blockDeleteUpdate'
import { Dialog } from '../../../Dialog'
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
}

export function DeleteBlock({
  variant = 'button',
  closeMenu
}: DeleteBlockProps): ReactElement {
  const [blockDelete] = useMutation<BlockDelete>(BLOCK_DELETE)
  const { enqueueSnackbar } = useSnackbar()

  const journey = useJourney()
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

  const handleDeleteBlock = async (): Promise<void> => {
    if (selectedBlock == null || journey == null || steps == null) return

    const deletedBlockParentOrder = selectedBlock.parentOrder
    const deletedBlockType = selectedBlock.__typename
    const stepsBeforeDelete = steps
    const stepBeforeDelete = selectedStep

    const { data } = await blockDelete({
      variables: {
        id: selectedBlock.id,
        journeyId: journey.id,
        parentBlockId: selectedBlock.parentBlockId
      },
      update(cache, { data }) {
        blockDeleteUpdate(selectedBlock, data?.blockDelete, cache, journey.id)
      }
    })

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
        handleClose={handleCloseDialog}
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
          edge="end"
          aria-controls="delete-block-actions"
          aria-haspopup="true"
          aria-expanded="true"
          disabled={selectedBlock == null}
          onClick={label === 'Card' ? handleOpenDialog : handleDeleteBlock}
        >
          <DeleteOutlineRounded />
        </IconButton>
      ) : (
        <MenuItem
          disabled={selectedBlock == null}
          onClick={label === 'Card' ? handleOpenDialog : handleDeleteBlock}
        >
          <ListItemIcon>
            <DeleteOutlineRounded />
          </ListItemIcon>
          <ListItemText>Delete {label}</ListItemText>
        </MenuItem>
      )}
    </>
  )
}
