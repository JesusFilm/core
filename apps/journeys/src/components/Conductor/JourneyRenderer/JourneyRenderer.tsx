import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import { ReactElement } from 'react'

import { TreeBlock, useBlocks } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'

import { StepFields } from '../../../../__generated__/StepFields'

export function JourneyRenderer(): ReactElement {
  const { blockHistory, treeBlocks, getNextBlock } = useBlocks()

  const getCurrentActiveBlock = (): TreeBlock<StepFields> =>
    blockHistory[blockHistory.length - 1] as TreeBlock<StepFields>
  const getPreviousBlock = (): TreeBlock<StepFields> =>
    blockHistory[blockHistory.length - 2] as TreeBlock<StepFields>

  const currentBlock = getCurrentActiveBlock()
  const previousBlock = getPreviousBlock()
  const nextBlock = getNextBlock({ activeBlock: currentBlock })

  const shouldRender = (id: string): boolean => {
    switch (id) {
      case currentBlock.id:
      case nextBlock?.id:
      case previousBlock?.id:
        return true
      default:
        return false
    }
  }

  return (
    <>
      {treeBlocks.map((block) => {
        const isCurrent = block.id === currentBlock.id
        return (
          <Fade
            key={block.id}
            in={isCurrent}
            timeout={{ appear: 0, enter: 200, exit: 0 }}
          >
            {shouldRender(block.id) ? (
              <Box
                sx={{
                  height: isCurrent ? 'inherit' : 'auto',
                  width: 'inherit',
                  position: isCurrent ? 'relative' : 'absolute'
                }}
              >
                <BlockRenderer block={block} />
              </Box>
            ) : (
              <></>
            )}
          </Fade>
        )
      })}
    </>
  )
}
