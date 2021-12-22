import { ReactElement } from 'react'
import { AppBar, IconButton, Toolbar, Typography } from '@mui/material'
import Link from 'next/link'
import { ChevronLeftRounded } from '@mui/icons-material'
import { Menu } from '../JourneyView/Menu'
import { useBreakpoints } from '@core/shared/ui'

export interface JourneysAppBarProps {
  variant: 'list' | 'view'
}

export function JourneysAppBar({ variant }: JourneysAppBarProps): ReactElement {
  const breakpoints = useBreakpoints()

  return (
    <>
      <AppBar position="fixed" color="default">
        {variant === 'view' ? (
          <Toolbar sx={{ flexGrow: 1, mr: breakpoints.md ? '328px' : 0 }}>
            <Link href={`/journeys`} passHref>
              <IconButton
                aria-label="back to journeys"
                edge="start"
                size="large"
                color="inherit"
                sx={{ mr: 2 }}
              >
                <ChevronLeftRounded />
              </IconButton>
            </Link>
            <Typography
              variant="subtitle1"
              component="div"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              Journey Details
            </Typography>
            <Menu />
          </Toolbar>
        ) : (
          <Toolbar sx={{ flexGrow: 1 }}>
            <Typography
              variant="subtitle1"
              component="div"
              noWrap
              sx={{ ml: 1 }}
            >
              Journeys
            </Typography>
          </Toolbar>
        )}
      </AppBar>
      <Toolbar />
    </>
  )
}
