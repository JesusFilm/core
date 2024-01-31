import CircleIcon from '@mui/icons-material/Circle'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { ReactElement, useEffect, useRef } from 'react'

import { TreeBlock, useBlocks } from '@core/journeys/ui/block'

import { StepFields } from '../../../../../../../apps/journeys/__generated__/StepFields'

export function PaginationBullets(): ReactElement {
  const { treeBlocks, blockHistory } = useBlocks()
  const activeBlock = blockHistory[
    blockHistory.length - 1
  ] as TreeBlock<StepFields>

  const activeCardRef = useRef<SVGSVGElement>(null)

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

  useEffect(() => {
    activeCardRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    })
  }, [activeBlock])

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 15,
        width: '100%',
        zIndex: 1,
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      <Stack
        direction="row"
        gap={3}
        sx={{
          width: '84px',
          height: '16px',
          overflow: 'hidden',
          alignItems: 'center'
        }}
      >
        <CircleIcon
          sx={{ height: '3px', width: '3px', visibility: 'hidden' }}
        />
        <CircleIcon
          sx={{ height: '6px', width: '6px', visibility: 'hidden' }}
        />
        {treeBlocks.map((block) => {
          if (block.id === activeBlock.id) {
            return (
              <CircleIcon
                key={block.id}
                sx={{ height: '10px', width: '10px' }}
                ref={activeCardRef}
              />
            )
          }
          return (
            <CircleIcon
              key={block.id}
              sx={{
                height: isAdjacentBlock(block)
                  ? '6px'
                  : isSecondBlock(block)
                  ? '4px'
                  : '4px',
                width: isAdjacentBlock(block)
                  ? '6px'
                  : isSecondBlock(block)
                  ? '4px'
                  : '4px'
              }}
            />
          )
        })}
        <CircleIcon
          sx={{ height: '6px', width: '6px', visibility: 'hidden' }}
        />
        <CircleIcon
          sx={{ height: '4px', width: '4px', visibility: 'hidden' }}
        />
      </Stack>
    </Box>
  )
}
