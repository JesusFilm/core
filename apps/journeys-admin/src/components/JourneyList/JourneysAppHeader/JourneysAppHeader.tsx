import { ReactElement } from 'react'
import * as React from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography';

const JourneysAppHeader = (): ReactElement => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        elevation={1}
        sx={{
          color: (theme) => theme.palette.text.primary,
          backgroundColor: (theme) => theme.palette.background.default
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'center' }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Journeys
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
  )
}

export default JourneysAppHeader
