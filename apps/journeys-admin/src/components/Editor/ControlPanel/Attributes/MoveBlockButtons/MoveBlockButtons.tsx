import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { searchBlocks } from '@core/journeys/ui/searchBlocks'
import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'
import ChevronUpIcon from '@core/shared/ui/icons/ChevronUp'

import { BlockOrderUpdate } from '../../../../../../__generated__/BlockOrderUpdate'

const StyledMoveButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.secondary.light,
  border: `1px solid ${theme.palette.divider}`,
  '&:first-of-type': {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12
  },
  '&:last-of-type': {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12
  },
  '&.MuiButtonGroup-grouped:not(:last-of-type)': {
    borderRight: 'none',
    borderColor: theme.palette.divider
  },
  '&.MuiButtonGroup-grouped:not(:last-of-type).Mui-disabled': {
    borderColor: theme.palette.divider
  },
  '&:hover': {
    backgroundColor: theme.palette.divider
  },
  '&:disabled': {
    backgroundColor: theme.palette.divider
  },
  height: 60
}))

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
interface MoveBlockButtonsProps {
  selectedBlock: TreeBlock
  selectedStep: TreeBlock
}

export function MoveBlockButtons({
  selectedBlock,
  selectedStep
}: MoveBlockButtonsProps): ReactElement {
  const [blockOrderUpdate] = useMutation<BlockOrderUpdate>(BLOCK_ORDER_UPDATE)
  const { journey } = useJourney()

  const parentBlock =
    selectedBlock?.parentBlockId != null
      ? searchBlocks(selectedStep.children, selectedBlock.parentBlockId)
      : selectedStep

  const handleMove = (move: 'up' | 'down'): (() => Promise<void>) => {
    return async () => {
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
    <Box data-testid="MoveBlockButtons">
      <ButtonGroup
        data-testid="move-block-buttons"
        disableElevation
        variant="contained"
      > */}
      
      <IconButton
          aria-label="move-block-up"
          disabled={selectedBlock.parentOrder === 0}
          onClick={handleMove('up')}
          onMouseDown={(e) => e.preventDefault()}
        >
          <ChevronUpIcon />
        </StyledMoveButton>
        <StyledMoveButton
          aria-label="move-block-down"
          disabled={selectedBlock.parentOrder === lastBlockIndex}
          onClick={handleMove('down')}
          onMouseDown={(e) => e.preventDefault()}
        >
          <ChevronDownIcon />
        </StyledMoveButton>
      </ButtonGroup>
      <Box sx={{ height: 24 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          align="center"
          noWrap
          component="div"
          sx={{ pt: 1 }}
        >
          Move Up or Down
        </Typography>
      </Box> */}
    </Stack>
  )
}
