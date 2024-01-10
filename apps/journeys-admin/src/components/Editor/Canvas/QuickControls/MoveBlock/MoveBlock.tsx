import { gql, useMutation } from '@apollo/client'
import IconButton from '@mui/material/IconButton'
import { ReactElement } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { searchBlocks } from '@core/journeys/ui/searchBlocks'
import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'
import ChevronUpIcon from '@core/shared/ui/icons/ChevronUp'

import { BlockOrderUpdate } from '../../../../../../__generated__/BlockOrderUpdate'

export const BLOCK_ORDER_UPDATE = gql`
  mutation BlockOrderUpdate($id: ID!, $journeyId: ID!, $parentOrder: Int!) {
    blockOrderUpdate(
      id: $id
      journeyId: $journeyId
      parentOrder: $parentOrder
    ) {
      id
      parentOrder
    }
  }
`

export function MoveBlock(): ReactElement {
  const [blockOrderUpdate] = useMutation<BlockOrderUpdate>(BLOCK_ORDER_UPDATE)
  const { journey } = useJourney()
  const {
    state: { selectedBlock, selectedStep }
  } = useEditor()

  const parentBlock =
    selectedBlock?.parentBlockId != null && selectedStep != null
      ? searchBlocks(selectedStep.children, selectedBlock.parentBlockId)
      : selectedStep

  const handleMove = (move: 'up' | 'down'): ((e) => Promise<void>) => {
    return async (e: MouseEvent) => {
      e.stopPropagation()
      if (selectedBlock?.parentOrder != null && journey != null) {
        const moveBy = move === 'up' ? -1 : 1

        await blockOrderUpdate({
          variables: {
            id: selectedBlock.id,
            journeyId: journey.id,
            parentOrder: selectedBlock.parentOrder + moveBy
          }
        })
      }
    }
  }

  const lastBlockIndex =
    parentBlock != null ? parentBlock.children.length - 1 : 0

  return (
    <>
      <IconButton
        aria-label="move-block-up"
        disabled={selectedBlock?.parentOrder === 0}
        onClick={handleMove('up')}
        onMouseDown={(e) => e.preventDefault()}
        sx={{
          borderRadius: '100%',
          border: '1px solid #E6E6E6',
          p: 3
        }}
      >
        <ChevronUpIcon />
      </IconButton>
      <IconButton
        aria-label="move-block-down"
        disabled={selectedBlock?.parentOrder === lastBlockIndex}
        onClick={handleMove('down')}
        onMouseDown={(e) => e.preventDefault()}
        sx={{
          borderRadius: '100%',
          border: '1px solid #E6E6E6',
          p: 3
        }}
      >
        <ChevronDownIcon />
      </IconButton>
    </>
  )
}
