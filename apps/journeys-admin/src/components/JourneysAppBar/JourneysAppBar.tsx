import { ReactElement } from 'react'
import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material'
import Link from 'next/link'
import { ChevronLeftRounded } from '@mui/icons-material'
import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'
import SingleJourneyMenu from '../SingleJourneyMenu'

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
          color: (theme) => theme.palette.text.primary,
          backgroundColor: (theme) => theme.palette.background.default
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {journey !== undefined ? (
            <>
              <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                <Link href={`/journeys`} passHref>
                  <IconButton>
                    <ChevronLeftRounded />
                  </IconButton>
                </Link>
                <Typography
                  variant="h4"
                  component="div"
                  sx={{ ml: 2, alignSelf: 'center' }}
                >
                  Journey
                </Typography>
              </Box>
              <SingleJourneyMenu journey={journey} />
            </>
          ) : (
            <Typography variant="h4" component="div" sx={{ ml: 4 }}>
              Journeys
            </Typography>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  )
}

export default JourneysAppBar
