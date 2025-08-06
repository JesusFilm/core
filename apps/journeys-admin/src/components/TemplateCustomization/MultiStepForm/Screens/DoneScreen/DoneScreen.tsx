import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

export function DoneScreen(): ReactElement {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Setup Complete
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Your journey template has been successfully configured!
      </Typography>
    </Box>
  )
}
