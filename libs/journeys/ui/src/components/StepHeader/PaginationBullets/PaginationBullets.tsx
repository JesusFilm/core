import CircleIcon from '@mui/icons-material/Circle'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { ReactElement, useEffect, useRef, useState } from 'react'

import { TreeBlock, useBlocks } from '@core/journeys/ui/block'
import { StepFields } from '../../Step/__generated__/StepFields'

export function PaginationBullets(): ReactElement {
  const { treeBlocks, blockHistory, previousActiveBlock } = useBlocks()
  const gap = 16
  // const [left, setLeft] = useState(32)
  const activeBlock = blockHistory[
    blockHistory.length - 1
  ] as TreeBlock<StepFields>

  const activeCardRef = useRef<SVGSVGElement>(null)
  //apply left (usestate) on all bullets
  // increment and decrement depending on nav left or right, need to consider the difference between active and prevActive
  // compare previousBlock with activeBlock
  // blockHistory.slice(-1)
  function isAdjacentBlock(block: TreeBlock): boolean {
    if (activeBlock.parentOrder == null || block.parentOrder == null)
      return false
    if (
      block.parentOrder - activeBlock.parentOrder === -1 ||
      activeBlock.parentOrder - block.parentOrder === -1
    ) {
      return true
    }
    return false
  }

  function isSecondBlock(block: TreeBlock): boolean {
    if (activeBlock.parentOrder == null || block.parentOrder == null)
      return false
    if (
      block.parentOrder - activeBlock.parentOrder === 2 ||
      activeBlock.parentOrder - block.parentOrder === 2
    ) {
      return true
    }
    return false
  }

  function updateLeft() {
    if (activeBlock.parentOrder !== null) {
    }
  }

  // useEffect(() => {
  //   activeCardRef.current?.scrollIntoView({
  //     behavior: 'smooth',
  //     block: 'center',
  //     inline: 'center'
  //   })
  // }, [activeBlock])

  console.log('blocks', treeBlocks)
  console.log('blockHist', blockHistory)

  const prevActiveBlock = blockHistory[blockHistory.length - 2]
  console.log('prevActiveBlock', prevActiveBlock)
  console.log('activeBlock', activeBlock)
  // console.log('left:', left)

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 15,
        width: '100%',
        zIndex: 1,
        display: 'flex'
      }}
    >
      <Stack
        direction="row"
        sx={{
          border: 'red solid 2px',
          position: 'absolute',
          transform: 'translateX(-50%)',
          width: '80px',
          height: '16px',
          alignItems: 'center',
          left: '50%',
          overflow: 'hidden'
        }}
      >
        {treeBlocks.map((block) => {
          if (block.id === activeBlock.id) {
            return (
              <CircleIcon
                key={block.id}
                sx={{
                  fontSize: '10px',
                  scale: '1',
                  color: 'primary.main',
                  left: `${
                    32 +
                    gap * (block.parentOrder !== null ? block.parentOrder : 1) -
                    (activeBlock.parentOrder !== null
                      ? activeBlock.parentOrder * gap
                      : 0)
                  }px`,
                  position: 'absolute',
                  transition: 'transform .2s, left .2s'
                }}
                ref={activeCardRef}
              />
            )
          }
          return (
            <CircleIcon
              key={block.id}
              sx={{
                fontSize: '10px',
                color: 'primary.dark',
                scale: isAdjacentBlock(block)
                  ? '.66'
                  : isSecondBlock(block)
                  ? '.33'
                  : '.33',
                opacity: '60%',
                left: `${
                  32 +
                  gap * (block.parentOrder !== null ? block.parentOrder : 1) -
                  (activeBlock.parentOrder !== null
                    ? activeBlock.parentOrder * gap
                    : 0)
                }px`,
                position: 'absolute',
                transition: 'transform .2s, left .2s'
              }}
            />
          )
        })}
      </Stack>
    </Box>
  )
}
