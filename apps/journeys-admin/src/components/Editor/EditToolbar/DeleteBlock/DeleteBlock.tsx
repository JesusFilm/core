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
import { BlockDelete } from '../../../../../__generated__/BlockDelete'
import { useJourney } from '../../../../libs/context'
import { blockDeleteUpdate } from '../../../../libs/blockDeleteUpdate/blockDeleteUpdate'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../../__generated__/GetJourney'
import { DeleteDialogue } from './DeleteDialogue'

export const BLOCK_DELETE = gql`
  mutation BlockDelete($id: ID!, $journeyId: ID!, $parentBlockId: ID) {
    blockDelete(id: $id, journeyId: $journeyId, parentBlockId: $parentBlockId) {
      id
      parentOrder
    }
  }
`
interface UpdatedSeletedReturn {
  type: 'SetSelectedBlockByIdAction' | 'SetSelectedStepAction'
  id?: string
  step?: TreeBlock<StepBlock>
}

interface UpdatedSelectedProps {
  parentOrder: number
  siblings: BlockDelete['blockDelete']
  type: string
  steps: Array<TreeBlock<StepBlock>>
  currentStep?: TreeBlock<StepBlock>
}

export function updateSelected({
  parentOrder,
  siblings,
  type,
  steps,
  currentStep
}: UpdatedSelectedProps): UpdatedSeletedReturn | null {
  // BUG: siblings not returning correct data for blocks nested in a gridBlock - resolve this when we decide how grid will be used
  if (siblings.length > 0) {
    const blockToSelect =
      siblings.find((sibling) => sibling.parentOrder === parentOrder) ??
      last(siblings)
    return {
      type: 'SetSelectedBlockByIdAction',
      id: blockToSelect?.id
    }
  } else if (currentStep != null && steps.length > 0) {
    const stepToSet =
      type !== 'StepBlock'
        ? currentStep
        : steps.find((step) => step.nextBlockId === currentStep.id) ??
          last(steps)
    return {
      type: 'SetSelectedStepAction',
      step: stepToSet
    }
  } else return null
}

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

  const handleDeleteBlock = async (): Promise<void> => {
    if (selectedBlock == null) return

    const toDeleteParentOrder = selectedBlock.parentOrder
    const toDeleteBlockType = selectedBlock.__typename

    const { data } = await blockDelete({
      variables: {
        id: selectedBlock.id,
        journeyId,
        parentBlockId: selectedBlock.parentBlockId
      },
      update(cache, { data }) {
        blockDeleteUpdate(selectedBlock, data?.blockDelete, cache, journeyId)
      }
    })

    if (data?.blockDelete != null && toDeleteParentOrder != null) {
      const toDispatch = updateSelected({
        parentOrder: toDeleteParentOrder,
        siblings: data.blockDelete,
        type: toDeleteBlockType,
        steps,
        currentStep: selectedStep
      })
      toDispatch != null && dispatch(toDispatch)
    }

    handleCloseModal()

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
      <DeleteDialogue
        handleDelete={handleDeleteBlock}
        open={open}
        handleClose={handleCloseModal}
      />
      {variant === 'button' ? (
        <IconButton
          id="delete-block-actions"
          edge="end"
          aria-controls="delete-block-actions"
          aria-haspopup="true"
          aria-expanded="true"
          disabled={selectedBlock == null}
          onClick={label === 'Block' ? handleDeleteBlock : handleOpenModal}
        >
          <DeleteOutlineRounded />
        </IconButton>
      ) : (
        <MenuItem
          disabled={selectedBlock == null}
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
