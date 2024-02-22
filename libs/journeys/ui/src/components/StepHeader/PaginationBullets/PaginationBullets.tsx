import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { TreeBlock, useBlocks } from '../../../libs/block'
import { StepFields } from '../../Step/__generated__/StepFields'

import { Bullet } from './Bullet'

export function PaginationBullets(): ReactElement {
  const { treeBlocks, blockHistory } = useBlocks()
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
        {treeBlocks.map((block) => {
          if (block.parentOrder == null || activeBlock.parentOrder == null)
            return <></>

          const isActive = block.id === activeBlock.id
          const gap = 16
          const initial = 38
          const distanceFromInitial = block.parentOrder * gap
          const moveDistance = activeBlock.parentOrder * gap

          return (
            <Bullet
              key={block.id}
              variant={
                isActive ? 'active' : isAdjacent(block) ? 'adjacent' : 'default'
              }
              left={initial + distanceFromInitial - moveDistance}
            />
          )
        })}
      </Stack>
    </Box>
  )
}
