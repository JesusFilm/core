import { ReactElement } from 'react'
import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material'
import Link from 'next/link'
import { ChevronLeftRounded } from '@mui/icons-material'
import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'

export interface JourneysAppBarProps {
  journey?: Journey
}

export function JourneysAppBar({ journey }: JourneysAppBarProps): ReactElement {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        elevation={1}
        sx={{
          color: 'secondary.dark',
          backgroundColor: 'background.paper'
        }}
      >
        <Toolbar sx={{ px: 3, height: 56 }}>
          {journey !== undefined && (
            <Link href={`/journeys`} passHref>
              <IconButton sx={{ mr: 1 }}>
                <ChevronLeftRounded />
              </IconButton>
            </Link>
          )}
          <Typography variant="subtitle1" component="div" sx={{ ml: 1 }}>
            {journey !== undefined ? 'Journey Details' : 'Journeys'}
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
  )
}
