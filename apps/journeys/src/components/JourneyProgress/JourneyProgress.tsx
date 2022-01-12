import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import withStyles from '@mui/styles/withStyles'
import { findIndex } from 'lodash'
import { ReactElement, useEffect, useState } from 'react'
import { useBlocks } from '../../libs/client/cache/blocks'

const BorderLinearProgress = withStyles(() => ({
  root: {
    height: 6,
    borderRadius: 3,
    width: '100%'
  },
  bar: {
    borderRadius: 3,
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
    <Box sx={{ display: 'flex', width: '100%' }}>
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
          marginLeft: '-6px',
          height: 6,
          width: 6,
          backgroundColor: '#6D6E80',
          borderRadius: 3,
          zIndex: 2,
          transition: 'opacity ease-out 0.5s',
          opacity: percentage === 0 ? 0 : 1
        }}
      />
    </Box>
  )
}
