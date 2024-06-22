import { Box, Button, Typography } from '@mui/material'
import { ReactElement } from 'react'
import { CopyTextField } from '../CopyTextField'

export function JourneysShareableLinkPage(): ReactElement {
  return (
    <Box
      sx={
        {
          // backgroundColor: 'red'
        }
      }
    >
      <Typography> Journeys Shareable Link Page</Typography>
      <Typography> Your Journey URL is: </Typography>
      <CopyTextField value="https://your.nextstep.is/journeyid" />
      <Typography> Share to: </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row' }}>
        <Button> Facebook</Button>
        <Button> Instagram</Button>
      </Box>
    </Box>
  )
}
