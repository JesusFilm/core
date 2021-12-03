import { ReactElement } from 'react'
import * as React from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import nextStepsLogo from './NextStepsLogo.svg'
import Image from 'next/image'

const JourneysAppHeader = (): ReactElement => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        elevation={1}
        sx={{ backgroundColor: (theme) => theme.palette.background.default }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'center' }}>
          {
            <Image
              src={nextStepsLogo}
              alt="Next Steps Logo"
              height={25}
              width={145}
            />
          }
        </Toolbar>
      </AppBar>
    </Box>
  )
}

export default JourneysAppHeader
