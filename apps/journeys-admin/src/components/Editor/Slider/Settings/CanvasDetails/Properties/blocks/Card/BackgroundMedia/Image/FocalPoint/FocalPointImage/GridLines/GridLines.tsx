import Box from '@mui/material/Box'
import { ReactElement } from 'react'

export function GridLines(): ReactElement {
  const gridPositions = [33.33, 66.66]

  return (
    <>
      {gridPositions.map((position) => (
        <>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: `${position}%`,
              bottom: 0,
              width: '1px',
              backgroundColor: 'rgba(255,255,255,0.5)'
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: `${position}%`,
              left: 0,
              right: 0,
              height: '1px',
              backgroundColor: 'rgba(255,255,255,0.5)'
            }}
          />
        </>
      ))}
    </>
  )
}
