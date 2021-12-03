import { ReactElement } from 'react'
import * as React from 'react'
import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material'
import Link from 'next/link'
import { ChevronLeftRounded } from '@mui/icons-material'

const SingleJourneyAppBar = (): ReactElement => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        sx={{
          color: (theme) => theme.palette.text.primary,
          backgroundColor: (theme) => theme.palette.background.default
        }}
      >
        <Toolbar>
          <Box my={2}>
            <Link href={`/journeys`} passHref>
              <IconButton>
                <ChevronLeftRounded />
              </IconButton>
            </Link>
          </Box>
          <Typography variant="h6" component="div">
            Journeys
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
  )
}

export default SingleJourneyAppBar
