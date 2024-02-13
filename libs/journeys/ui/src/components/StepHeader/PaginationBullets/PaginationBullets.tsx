import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { TreeBlock, useBlocks } from '../../../libs/block'
import { StepFields } from '../../Step/__generated__/StepFields'

import { Bullet } from './Bullet'

export function PaginationBullets(): ReactElement {
  const { treeBlocks, blockHistory } = useBlocks()
  const gap = 16
  const activeBlock = blockHistory[
    blockHistory.length - 1
  ] as TreeBlock<StepFields>

  function isAdjacent(block: TreeBlock): boolean {
    if (activeBlock.parentOrder !== null && block.parentOrder !== null)
      if (
        block.parentOrder - activeBlock.parentOrder === -1 ||
        activeBlock.parentOrder - block.parentOrder === -1
      ) {
        return true
      }
    return false
  }

  function isAdjacentNext(block: TreeBlock): boolean {
    if (activeBlock.parentOrder !== null && block.parentOrder !== null)
      if (
        block.parentOrder - activeBlock.parentOrder === 2 ||
        activeBlock.parentOrder - block.parentOrder === 2
      ) {
        return true
      }
    return false
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 13,
        width: '100%',
        zIndex: 1,
        display: 'flex'
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
        {treeBlocks.map((block) => {
          if (block.parentOrder == null || activeBlock.parentOrder == null)
            return <></>
          const base = 38
          const distanceFromBase = block.parentOrder * gap
          const moveDistance = activeBlock.parentOrder * gap

          if (block.id === activeBlock.id) {
            return (
              <Bullet
                key={block.id}
                data-testid="activeBullet"
                variant="lg"
                sx={{
                  color: { xs: 'primary.main', lg: 'white' },
                  left: `${base + distanceFromBase - moveDistance}px`,
                  position: 'absolute',
                  transition: 'scale .2s, left .2s'
                }}
              />
            )
          } else {
            return (
              <Bullet
                key={block.id}
                variant={
                  isAdjacent(block) ? 'md' : isAdjacentNext(block) ? 'sm' : 'sm'
                }
                sx={{
                  color: { xs: 'primary.main', lg: 'white' },
                  left: `${base + distanceFromBase - moveDistance}px`,
                  position: 'absolute',
                  transition: 'scale .2s, left .2s'
                }}
              />
            )
          }
        })}
      </Stack>
    </Box>
  )
}
