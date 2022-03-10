import { ReactElement, useState } from 'react'
import IconButton from '@mui/material/IconButton'
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded'
import { gql, useMutation } from '@apollo/client'
import { useEditor, TreeBlock } from '@core/journeys/ui'
import MenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import { useSnackbar } from 'notistack'
import last from 'lodash/last'
import Modal from '@mui/material/Modal'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Button from '@mui/material/Button'
import { BlockDelete } from '../../../../../__generated__/BlockDelete'
import { useJourney } from '../../../../libs/context'
import { blockDeleteUpdate } from '../../../../libs/blockDeleteUpdate/blockDeleteUpdate'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../../__generated__/GetJourney'

export const BLOCK_DELETE = gql`
  mutation BlockDelete($id: ID!, $journeyId: ID!, $parentBlockId: ID!) {
    blockDelete(id: $id, journeyId: $journeyId, parentBlockId: $parentBlockId) {
      id
      parentOrder
    }
  }
`

interface DeleteBlockProps {
  variant: 'button' | 'list-item'
}

export function DeleteBlock({
  variant = 'button'
}: DeleteBlockProps): ReactElement {
  const [blockDelete] = useMutation<BlockDelete>(BLOCK_DELETE)
  const { enqueueSnackbar } = useSnackbar()

  const { id: journeyId } = useJourney()
  const {
    state: { selectedBlock, selectedStep, steps },
    dispatch
  } = useEditor()

  const label = selectedBlock?.__typename === 'StepBlock' ? 'Card' : 'Block'
  const [open, setOpen] = useState(false)
  const handleOpenModal = (): void => setOpen(true)
  const handleCloseModal = (): void => setOpen(false)

  function updateSelected(
    parentOrder: number,
    siblings,
    deletedStep?: TreeBlock<StepBlock>
  ): void {
    // If 0, need to selected other sibling blocks
    if (siblings.length > 0) {
      const toSetParentOrder = parentOrder > 0 ? parentOrder - 1 : 0
      const blockToSelect = siblings.find(
        (sibling) => sibling.parentOrder === toSetParentOrder
      )
      dispatch({
        type: 'SetSelectedBlockByIdAction',
        id: blockToSelect.id
      })
    } else if (deletedStep != null && steps.length > 0) {
      // needs to select parent card if block
      const stepToSet =
        steps.find((step) => step.nextBlockId === deletedStep.id) ?? last(steps)
      dispatch({
        type: 'SetSelectedStepAction',
        step: stepToSet
      })
    }
  }

  const handleDeleteBlock = async (): Promise<void> => {
    if (selectedBlock == null) return
    handleCloseModal()

    const toDeleteParentOrder = selectedBlock.parentOrder
    const toDeleteBlockType = selectedBlock.__typename

    const { data } = await blockDelete({
      variables: {
        id: selectedBlock.id,
        journeyId,
        parentBlockId: selectedBlock.parentBlockId ?? 0
      },
      update(cache, { data }) {
        blockDeleteUpdate(selectedBlock, data?.blockDelete, cache, journeyId)
      }
    })

    data?.blockDelete != null &&
      toDeleteParentOrder != null &&
      updateSelected(toDeleteParentOrder, data.blockDelete, selectedStep)

    toDeleteBlockType !== 'StepBlock'
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
      <Modal
        open={open}
        onClose={handleCloseModal}
        aria-labelledby="delete-card-modal"
        aria-describedby="delete-card-modal"
        sx={{
          height: '188px',
          width: '372px',
          m: 'auto'
        }}
      >
        <Card
          sx={{
            display: 'flex',
            flexDirection: 'column',
            px: 2,
            pb: 2
          }}
        >
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Delete Card?
            </Typography>
            <Typography variant="body1">
              Are you sure you would like to delete this card?
            </Typography>
          </CardContent>
          <CardActions sx={{ ml: 'auto' }}>
            <Button
              color="secondary"
              onClick={handleCloseModal}
              sx={{ fontWeight: 'normal' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteBlock}
              sx={{ fontWeight: 'normal', pl: 6 }}
            >
              Delete
            </Button>
          </CardActions>
        </Card>
      </Modal>

      {variant === 'button' ? (
        <IconButton
          id="delete-block-actions"
          edge="end"
          aria-controls="delete-block-actions"
          aria-haspopup="true"
          aria-expanded="true"
          onClick={label === 'Block' ? handleDeleteBlock : handleOpenModal}
        >
          <DeleteOutlineRounded />
        </IconButton>
      ) : (
        <MenuItem
          onClick={label === 'Block' ? handleDeleteBlock : handleOpenModal}
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
