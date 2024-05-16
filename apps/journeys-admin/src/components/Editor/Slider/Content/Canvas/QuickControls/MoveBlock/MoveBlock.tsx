import IconButton from '@mui/material/IconButton'
import { ReactElement } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { searchBlocks } from '@core/journeys/ui/searchBlocks'
import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'
import ChevronUpIcon from '@core/shared/ui/icons/ChevronUp'

import { useBlockOrderUpdateMutation } from '../../../../../../../libs/useBlockOrderUpdateMutation'

export function MoveBlock(): ReactElement {
  const [blockOrderUpdate] = useBlockOrderUpdateMutation()
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
        onMouseUp={handleMove('up')}
        onMouseDown={(e) => e.preventDefault()}
      >
        <ChevronUpIcon />
      </IconButton>
      <IconButton
        aria-label="move-block-down"
        disabled={selectedBlock?.parentOrder === lastBlockIndex}
        onMouseUp={handleMove('down')}
        onMouseDown={(e) => e.preventDefault()}
      >
        <ChevronDownIcon />
      </IconButton>
    </>
  )
}
