import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { ReactElement, useEffect, useMemo, useState } from 'react'

import { TreeBlock, useBlocks } from '../../../libs/block'
import { filterActionBlocks } from '../../../libs/filterActionBlocks'
import { ActionBlock } from '../../../libs/isActionBlock'
import { useJourney } from '../../../libs/JourneyProvider'
import { StepFields } from '../../Step/__generated__/StepFields'

import { Bullet } from './Bullet'

export function PaginationBullets(): ReactElement {
  const { treeBlocks, blockHistory } = useBlocks()
  const { variant } = useJourney()

  const [activeIndex, setActiveIndex] = useState<number>(0)
  const [activeBlock, setActiveBlock] = useState<TreeBlock<StepFields>>(
    // set initial object to stop pagination sliding on initialization
    {
      nextBlockId: 'initial'
    } as unknown as TreeBlock<StepFields>
  )

  const BULLET_GAP = 16
  const BULLET_INITIAL_POSITION = 52

  const adminBullets = useMemo(() => {
    return {
      bullets: [0, 1, 2],
      activeIndex: 1,
      distance: 2 * BULLET_GAP
    }
  }, [])

  const bullets: number[] = useMemo(() => {
    if (variant === 'admin') {
      return adminBullets.bullets
    } else {
      return bulletsToRender(treeBlocks)
    }
  }, [treeBlocks, variant, adminBullets])

  useEffect(() => {
    const currentActiveBlock = blockHistory[
      blockHistory.length - 1
    ] as TreeBlock<StepFields>
    setActiveBlock(currentActiveBlock)

    // to prevent infinite card loops from running out of pagination dots
    removeAlreadyVisitedBlocksFromHistory(blockHistory, currentActiveBlock)
    const hasBlockAction =
      currentActiveBlock?.nextBlockId != null ||
      filterActionBlocks(currentActiveBlock).some((block) => hasAction(block))

    if (hasBlockAction) {
      setActiveIndex(blockHistory.length - 1)
    } else if (variant === 'admin') {
      setActiveIndex(adminBullets.activeIndex)
    } else {
      setActiveIndex(bullets.length - 1)
    }
  }, [blockHistory, bullets.length, variant, adminBullets])

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
          const distanceFromInitial = i * BULLET_GAP
          const moveDistance = (): number => {
            // if on a card that has no next step - show end pagination bullets state
            const hasBlockAction =
              activeBlock?.nextBlockId != null ||
              filterActionBlocks(activeBlock).some((block) => hasAction(block))
            if (hasBlockAction) {
              return blockHistory.length * BULLET_GAP
            } else if (variant === 'admin') {
              return adminBullets.distance
            } else {
              return bullets.length * BULLET_GAP
            }
          }

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
              left={
                BULLET_INITIAL_POSITION + distanceFromInitial - moveDistance()
              }
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
    (block, _, treeBlockArr) => {
      const connectionExists = (id: string): boolean => {
        const block = treeBlockArr.find((connectionBlock) => {
          if (connectionBlock.__typename !== 'StepBlock') return undefined
          const connectedByStep = connectionBlock.id === id
          const connectedByAction =
            filterActionBlocks(connectionBlock).find((actionBlock) =>
              hasAction(actionBlock, id)
            ) != null
          if (connectedByStep || connectedByAction) {
            return connectionBlock
          }
          return undefined
        })
        return block != null
      }

      if (
        (block.__typename === 'StepBlock' && block.nextBlockId != null) ||
        block.parentOrder === 0 ||
        connectionExists(block.id)
      ) {
        return true
      }
      return false
    }
  )
  return [...new Array(treeBlocksWithoutOrphanBlocks.length)]
}

function hasAction(block: ActionBlock, id?: string): boolean {
  if (block?.action?.__typename !== 'NavigateToBlockAction') return false

  return id != null
    ? block.action.blockId === id
    : block.action.blockId !== null
}
