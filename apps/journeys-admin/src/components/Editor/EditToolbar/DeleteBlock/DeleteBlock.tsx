import { ReactElement } from 'react'
import IconButton from '@mui/material/IconButton'
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded'
import { gql, useMutation } from '@apollo/client'
import { useEditor, searchBlocks, TreeBlock } from '@core/journeys/ui'
import MenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import { useSnackbar } from 'notistack'
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

  function updateSelected(
    parentOrder: number,
    siblings,
    deletedStep?: TreeBlock<StepBlock>
  ): void {
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
      const stepToSet =
        steps.find((step) => step.nextBlockId === deletedStep.id) ?? steps[0]
      dispatch({
        type: 'SetSelectedStepAction',
        step: stepToSet
      })
    }
  }

  const handleDeleteBlock = async (): Promise<void> => {
    if (selectedBlock == null) return

    const toDeleteParentOrder = selectedBlock.parentOrder

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

    enqueueSnackbar('Block Deleted', {
      variant: 'success',
      preventDuplicate: true
    })
  }

  return variant === 'button' ? (
    <IconButton
      id="delete-block-actions"
      edge="end"
      aria-controls="delete-block-actions"
      aria-haspopup="true"
      aria-expanded="true"
      onClick={handleDeleteBlock}
    >
      <DeleteOutlineRounded />
    </IconButton>
  ) : (
    <MenuItem onClick={handleDeleteBlock}>
      <ListItemIcon>
        <DeleteOutlineRounded />
      </ListItemIcon>
      <ListItemText>Delete Block</ListItemText>
    </MenuItem>
  )
}
