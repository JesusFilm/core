import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { ReactElement, useEffect, useMemo, useState } from 'react'

import { TreeBlock, useBlocks } from '../../../libs/block'
import { BlockFields_StepBlock as StepBlock } from '../../../libs/block/__generated__/BlockFields'
import { filterActionBlocks } from '../../../libs/filterActionBlocks'
import { StepFields } from '../../Step/__generated__/StepFields'

import { Bullet } from './Bullet'

interface HasBlockId {
  action: { blockId: string }
}

export function PaginationBullets(): ReactElement {
  const { treeBlocks, blockHistory } = useBlocks()

  const [activeIndex, setActiveIndex] = useState<number>(0)
  const [activeBlock, setActiveBlock] = useState<TreeBlock<StepFields>>(
    // set initial object to stop pagination sliding on initialization
    {
      nextBlockId: 'initial'
    } as unknown as TreeBlock<StepFields>
  )

  const bullets: number[] = useMemo(
    () => bulletsToRender(treeBlocks),
    [treeBlocks]
  )

  useEffect(() => {
    const currentActiveBlock = blockHistory[
      blockHistory.length - 1
    ] as TreeBlock<StepFields>
    setActiveBlock(currentActiveBlock)

    // to prevent infinite card loops from running out of pagination dots
    removeAlreadyVisitedBlocksFromHistory(blockHistory, currentActiveBlock)

    setActiveIndex(
      currentActiveBlock?.nextBlockId != null ||
        filterActionBlocks(currentActiveBlock).some(
          (block) => (block as HasBlockId)?.action?.blockId != null
        )
        ? blockHistory.length - 1
        : bullets.length - 1
    )
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
          const initial = 52
          const distanceFromInitial = i * gap
          // if on a card that has no next step - show end pagination bullets state
          const moveDistance =
            activeBlock?.nextBlockId != null ||
            filterActionBlocks(activeBlock).some(
              (block) => (block as HasBlockId)?.action?.blockId != null
            )
              ? blockHistory.length * gap
              : bullets.length * gap

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
    return
  }
  // paginate back if you have already visited card
  blockHistory.forEach((block, i) => {
    if (block.id === currentActiveBlock.id) {
      blockHistory.splice(i + 1, blockHistory.length - i)
    }
  })
}

function bulletsToRender(treeBlocks: TreeBlock[]): number[] {
  const treeBlocksWithoutOrphanBlocks = treeBlocks.filter(
    (block) =>
      (block as StepBlock).nextBlockId != null ||
      treeBlocks.some(
        (someBlock) =>
          (someBlock as StepBlock)?.nextBlockId === block?.id ||
          filterActionBlocks(someBlock as TreeBlock<StepBlock>).some(
            (actionBlocks) =>
              (actionBlocks as HasBlockId)?.action?.blockId === block.id
          )
      ) ||
      block.parentOrder === 0
  )
  return [...new Array(treeBlocksWithoutOrphanBlocks.length)]
}
