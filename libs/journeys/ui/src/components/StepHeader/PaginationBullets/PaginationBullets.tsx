import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import Circle from '@core/shared/ui/icons/Circle'

import { TreeBlock, useBlocks } from '../../../libs/block'
import { StepFields } from '../../Step/__generated__/StepFields'

export function PaginationBullets(): ReactElement {
  const { treeBlocks, blockHistory } = useBlocks()
  const gap = 17
  const activeBlock = blockHistory[
    blockHistory.length - 1
  ] as TreeBlock<StepFields>

  function isAdjacentBlock(block: TreeBlock): boolean {
    if (activeBlock.parentOrder !== null && block.parentOrder !== null)
      if (
        block.parentOrder - activeBlock.parentOrder === -1 ||
        activeBlock.parentOrder - block.parentOrder === -1
      ) {
        return true
      }
    return false
  }

  function isSecondBlock(block: TreeBlock): boolean {
    if (activeBlock.parentOrder !== null && block.parentOrder !== null)
      if (
        block.parentOrder - activeBlock.parentOrder === 2 ||
        activeBlock.parentOrder - block.parentOrder === 2
      ) {
        return true
      }
    return false
  }

  console.log('treeBlocks', treeBlocks)
  console.log('blockHist', blockHistory)
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
          transform: 'translateX(-40%)',
          width: '84px',
          height: '16px',
          alignItems: 'center',
          left: '50%',
          overflow: 'hidden'
        }}
      >
        {treeBlocks.map((block) => {
          if (block.parentOrder === null || activeBlock.parentOrder === null)
            return <></>
          if (block.id === activeBlock.id) {
            return (
              <Circle
                key={block.id}
                data-testid="activeBlock"
                sx={{
                  fontSize: '8px',
                  scale: '1',
                  color: { xs: 'primary.main', lg: 'white' },
                  bgcolor: { xs: 'primary.main', lg: 'white' },
                  borderRadius: '100%',
                  left: `${
                    32 + gap * block.parentOrder - activeBlock.parentOrder * gap
                  }px`,
                  position: 'absolute',
                  transition: 'scale .2s, left .2s'
                }}
              />
            )
          } else {
            return (
              <Circle
                key={block.id}
                sx={{
                  fontSize: '8px',
                  color: { xs: 'primary.main', lg: 'white' },
                  bgcolor: { xs: 'primary.main', lg: 'white' },
                  borderRadius: '100%',
                  scale: isAdjacentBlock(block)
                    ? '.66'
                    : isSecondBlock(block)
                    ? '.33'
                    : '.33',
                  opacity: '60%',
                  left: `${
                    32 + gap * block.parentOrder - activeBlock.parentOrder * gap
                  }px`,
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
