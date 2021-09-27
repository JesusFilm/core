import { LinearProgress, Box } from '@mui/material'
import { withStyles } from '@mui/styles'
import { findIndex } from 'lodash'
import { ReactElement, useEffect, useState } from 'react'
import { useBlocks } from '../../libs/client/cache/blocks'

const BorderLinearProgress = withStyles(() => ({
  root: {
    height: 10,
    borderRadius: 5
  },
  bar: {
    borderRadius: 5,
    backgroundColor: '#6D6E80'
  }
}))(LinearProgress)

export function JourneyProgress(): ReactElement {
  const { activeBlock, treeBlocks } = useBlocks()
  const [percentage, setPercentage] = useState(0)

  useEffect(() => {
    if (activeBlock != null) {
      if (activeBlock.nextBlockId != null) {
        const position = findIndex(treeBlocks, ['id', activeBlock.id])
        if (position === -1) {
          setPercentage(0)
        } else if (position === 0) {
          setPercentage(0)
        } else {
          setPercentage(((position + 1) / treeBlocks.length) * 100)
        }
      } else {
        setPercentage(100)
      }
    } else {
      setPercentage(0)
    }
  }, [activeBlock, treeBlocks])

  return (
    <Box my={2} sx={{ position: 'relative' }}>
      <BorderLinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          transition: 'background ease-out 0.5s',
          background:
            percentage === 0
              ? 'linear-gradient(90deg, rgba(192,193,207,1) 0%, rgba(192,193,207,1) 100%)'
              : 'linear-gradient(90deg, rgba(192,193,207,1) 0%, rgba(255,255,255,1) 100%)'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          height: '10px',
          width: '10px',
          backgroundColor: '#6D6E80',
          borderRadius: '50%',
          top: 0,
          right: 0,
          transition: 'opacity ease-out 0.5s',
          opacity: percentage === 0 ? 0 : 1
        }}
      />
    </Box>
  )
}
