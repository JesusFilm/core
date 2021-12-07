import { ReactElement } from 'react'
import * as React from 'react'
import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material'
import Link from 'next/link'
import { ChevronLeftRounded } from '@mui/icons-material'
import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'

export interface JourneysAppBarProps {
  journey?: Journey
}

const JourneysAppBar = ({ journey }: JourneysAppBarProps): ReactElement => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        elevation={1}
        sx={{
          px: 4,
          color: (theme) => theme.palette.text.primary,
          backgroundColor: (theme) => theme.palette.background.default
        }}
      >
        <Toolbar>
          {journey !== undefined && (
            <Box>
              <Link href={`/journeys`} passHref>
                <IconButton>
                  <ChevronLeftRounded />
                </IconButton>
              </Link>
            </Box>
          )}
          <Typography variant="h4" component="div" sx={{ ml: 2 }}>
            {journey !== undefined ? 'Journey' : 'Journeys'}
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
  )
}

export default JourneysAppBar
