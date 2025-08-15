import IconButton from '@mui/material/IconButton'
import { ReactElement } from 'react'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { searchBlocks } from '@core/journeys/ui/searchBlocks'
import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'
import ChevronUpIcon from '@core/shared/ui/icons/ChevronUp'

import {
  getNewParentOrder,
  useBlockOrderUpdateMutation
} from '../../../../../../../libs/useBlockOrderUpdateMutation'

export function MoveBlock(): ReactElement {
  const [blockOrderUpdate] = useBlockOrderUpdateMutation()
  const {
    dispatch,
    state: { selectedBlock, selectedStep }
  } = useEditor()
  const { add } = useCommand()

  const parentBlock =
    selectedBlock?.parentBlockId != null && selectedStep != null
      ? searchBlocks(selectedStep.children, selectedBlock.parentBlockId)
      : selectedStep

  function handleMoveBlock(move: number): void {
    if (selectedBlock?.parentOrder == null || parentBlock == null) return

    const parentOrder = selectedBlock.parentOrder + move

    add({
      parameters: {
        execute: { parentOrder },
        undo: { parentOrder: selectedBlock.parentOrder }
      },
      execute({ parentOrder }) {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedStep,
          selectedBlock
        })
        void blockOrderUpdate({
          variables: {
            id: selectedBlock.id,
            parentOrder
          },
          optimisticResponse: {
            blockOrderUpdate: getNewParentOrder(
              [parentBlock],
              selectedBlock,
              parentOrder
            )
          }
        })
      }
    })
  }

  function handleMoveBlockUp(): void {
    handleMoveBlock(-1)
  }

  function handleMoveBlockDown(): void {
    handleMoveBlock(1)
  }

  const lastBlockIndex =
    parentBlock != null
      ? parentBlock.children.filter(({ parentOrder }) => parentOrder != null)
          .length - 1
      : 0

  return (
    <>
      <IconButton
        aria-label="move-block-up"
        disabled={selectedBlock?.parentOrder === 0}
        // onClickCapture event does not get ovverridden by parent components for RadioOptionBlocks
        onClickCapture={handleMoveBlockUp}
        sx={{
          p: 1
        }}
      >
        <ChevronUpIcon />
      </IconButton>
      <IconButton
        aria-label="move-block-down"
        disabled={selectedBlock?.parentOrder === lastBlockIndex}
        // onClickCapture event does not get ovverridden by parent components for RadioOptionBlocks
        onClickCapture={handleMoveBlockDown}
        sx={{
          p: 1
        }}
      >
        <ChevronDownIcon />
      </IconButton>
    </>
  )
}
