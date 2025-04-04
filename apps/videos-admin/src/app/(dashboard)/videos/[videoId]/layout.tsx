import Box from '@mui/material/Box'
import { ReactElement } from 'react'

export default function VideoViewLayout({ children }): ReactElement {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: { sm: '100%', md: '1300px' },
        height: '100%'
      }}
      data-testid="VideoViewContainer"
    >
      {children}
    </Box>
  )
}
