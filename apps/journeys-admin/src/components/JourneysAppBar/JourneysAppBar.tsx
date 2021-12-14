import { ReactElement } from 'react'
import { AppBar, Divider, IconButton, Toolbar, Typography } from '@mui/material'
import Link from 'next/link'
import { ChevronLeftRounded } from '@mui/icons-material'
import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'
import Menu from '../SingleJourney/Menu'

export interface JourneysAppBarProps {
  journey?: Journey
}

const JourneysAppBar = ({ journey }: JourneysAppBarProps): ReactElement => {
  return (
    <AppBar
      position="fixed"
      color="default"
      sx={{ display: 'flex', flexDirection: 'row' }}
    >
      {journey !== undefined ? (
        <Toolbar sx={{ flexGrow: 1, mr: '328px' }}>
          <Link href={`/journeys`} passHref>
            <IconButton edge="start" aria-label="back to journeys">
              <ChevronLeftRounded />
            </IconButton>
          </Link>
          <Typography
            variant="subtitle1"
            component="div"
            sx={{ ml: 2, flexGrow: 1 }}
          >
            Journey Details
          </Typography>

          <Menu journey={journey} />
        </Toolbar>
      ) : (
        <Toolbar>
          <Typography variant="subtitle1" component="div" sx={{ ml: 1 }}>
            Journeys
          </Typography>
        </Toolbar>
      )}
      <Divider />
    </AppBar>
  )
}

export default JourneysAppBar
