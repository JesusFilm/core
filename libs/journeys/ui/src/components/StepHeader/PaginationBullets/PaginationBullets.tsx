import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { ReactElement, useEffect, useState } from 'react'

import { TreeBlock, useBlocks } from '../../../libs/block'
import { StepFields } from '../../Step/__generated__/StepFields'

import { Bullet } from './Bullet'

export function PaginationBullets(): ReactElement {
  const { treeBlocks, blockHistory } = useBlocks()

  const [activeIndex, setActiveIndex] = useState<number>(0)
  const [activeBlock, setActiveBlock] = useState<TreeBlock<StepFields>>(
    // set initial object to stop pagination sliding on initialization
    {
      nextBlockId: 'initial'
    } as unknown as TreeBlock<StepFields>
  )

  // filter out orphan step blocks
  const bullets = [
    ...new Array(
      treeBlocks.filter(
        (blocks) =>
          (blocks as StepFields).nextBlockId != null ||
          treeBlocks.some(
            (includesBlocks) =>
              (includesBlocks as StepFields).nextBlockId === blocks.id
          ) ||
          blocks.parentOrder === 0
      ).length
    )
  ]

  useEffect(() => {
    const currentActiveBlock = blockHistory[
      blockHistory.length - 1
    ] as TreeBlock<StepFields>
    setActiveBlock(currentActiveBlock)

    // to prevent infinte card loops from running out of pagination dots
    removeAlreadyVisitedBlocksFromHistory(blockHistory, currentActiveBlock)

    currentActiveBlock?.nextBlockId != null
      ? setActiveIndex(blockHistory.length - 1)
      : setActiveIndex(bullets.length - 1)
  }, [blockHistory, bullets.length])

  return (
    <Box
      data-testid="pagination-bullets"
      sx={{
        position: 'absolute',
        top: 13,
        width: '100%',
        zIndex: 1
      }}
    >
      <Stack
        direction="row"
        sx={{
          position: 'absolute',
          transform: 'translateX(-50%)',
          width: '84px',
          height: '16px',
          alignItems: 'center',
          left: '50%',
          overflow: 'hidden'
        }}
      >
        {bullets.map((val, i) => {
          const gap = 16
          const initial = 48
          const distanceFromInitial = i * gap
          // if on a card that has no next step - show end pagnination bullets state
          const moveDistance =
            activeBlock?.nextBlockId == null
              ? bullets.length * gap
              : blockHistory.length * gap

          return (
            <Bullet
              key={val}
              variant={
                activeIndex === i
                  ? 'active'
                  : activeIndex + 1 === i || activeIndex - 1 === i
                  ? 'adjacent'
                  : 'default'
              }
              left={initial + distanceFromInitial - moveDistance}
            />
          )
        })}
      </Stack>
    </Box>
  )
}

function removeAlreadyVisitedBlocksFromHistory(
  blockHistory: TreeBlock[],
  currentActiveBlock: TreeBlock<StepFields>
): void {
  // paginate to beginning if you are back at the starting point
  if (currentActiveBlock?.id === blockHistory[0]?.id) {
    blockHistory.splice(1, blockHistory.length - 1)
  }
  // paginate back if you have already visited card
  let prevCards = []
  prevCards = blockHistory.filter((block) => block.id === currentActiveBlock.id)
  if (prevCards.length > 1) {
    blockHistory.forEach((block, i) => {
      if (block.id === currentActiveBlock.id) {
        blockHistory.splice(i + 1, blockHistory.length - i)
      }
    })
  }
}
