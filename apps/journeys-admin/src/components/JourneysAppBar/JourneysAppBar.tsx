import { ReactElement } from 'react'
import { AppBar, IconButton, Toolbar, Typography } from '@mui/material'
import Link from 'next/link'
import { ChevronLeftRounded } from '@mui/icons-material'
import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'
import Menu from '../SingleJourney/Menu'

export interface JourneysAppBarProps {
  journey?: Journey
}

const JourneysAppBar = ({ journey }: JourneysAppBarProps): ReactElement => {
  return (
    <AppBar position="fixed" color="default">
      <Toolbar>
        {journey !== undefined ? (
          <>
            <Link href={`/journeys`} passHref>
              <IconButton edge="start" aria-label="back to journeys">
                <ChevronLeftRounded />
              </IconButton>
            </Link>
            <Typography
              variant="subtitle1"
              component="div"
              sx={{ ml: 2, alignSelf: 'center', flexGrow: 1 }}
            >
              Journey Details
            </Typography>

            <Menu journey={journey} />
          </>
        ) : (
          <Typography variant="subtitle1" component="div">
            Journeys
          </Typography>
        )}
      </Toolbar>
    </AppBar>
  )
}

export default JourneysAppBar
