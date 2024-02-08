import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import { ReactElement, useEffect } from 'react'

import { TreeBlock, useBlocks } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'

import { StepFields } from '../../../../__generated__/StepFields'

export function JourneyRenderer(): ReactElement {
  const {
    blockHistory,
    treeBlocks,
    getNextBlock,
    setShowNavigation,
    setShowHeaderFooter
  } = useBlocks()

  const getCurrentActiveBlock = (): TreeBlock<StepFields> =>
    blockHistory[blockHistory.length - 1] as TreeBlock<StepFields>
  const getPreviousBlock = (): TreeBlock<StepFields> =>
    blockHistory[blockHistory.length - 2] as TreeBlock<StepFields>

  const currentBlock = getCurrentActiveBlock()
  const previousBlock = getPreviousBlock()
  const nextBlock = getNextBlock({ activeBlock: currentBlock })

  useEffect(() => {
    setShowHeaderFooter(true)
  }, [currentBlock, setShowHeaderFooter])

  return (
    <>
      {treeBlocks.map((block) => {
        let height, width, position
        const isCurrent = block.id === currentBlock.id
        const isPreRender =
          block.id === nextBlock?.id || block.id === previousBlock?.id

        if (isCurrent) {
          height = 'inherit'
          width = 'inherit'
          position = 'relative'
        } else if (isPreRender) {
          height = '-webkit-fill-available;'
          width = '-webkit-fill-available;'
          position = 'absolute'
        } else {
          height = 0
          width = 0
          position = 'none'
        }

        return (
          <Fade
            key={block.id}
            in={isCurrent}
            timeout={{ appear: 0, enter: 200, exit: 0 }}
          >
            <Box
              className={isCurrent ? 'active-card' : ''}
              onClick={() => setShowNavigation(true)}
              sx={{
                height,
                width,
                position
              }}
            >
              <BlockRenderer block={block} />
            </Box>
          </Fade>
        )
      })}
    </>
  )
}
