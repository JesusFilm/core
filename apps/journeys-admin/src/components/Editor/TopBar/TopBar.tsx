import { AppBar, IconButton, Toolbar, Typography } from '@mui/material'
import { ReactElement } from 'react'
import { ChevronLeft } from '@mui/icons-material'
import Link from 'next/link'
import { DRAWER_WIDTH } from '../Drawer'

interface TopBarProps {
  slug: string
  title: string
}

export function TopBar({ slug, title }: TopBarProps): ReactElement {
  return (
    <>
      <AppBar
        position="fixed"
        color="default"
        sx={{
          marginRight: { sm: `${DRAWER_WIDTH}px` },
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` }
        }}
      >
        <Toolbar>
          <Link href={`/journeys/${slug}`} passHref>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="back"
              sx={{ mr: 2 }}
            >
              <ChevronLeft />
            </IconButton>
          </Link>
          <Typography
            variant="subtitle1"
            noWrap
            component="div"
            sx={{ flexGrow: 1 }}
          >
            {title}
          </Typography>
        </Toolbar>
      </AppBar>
      <Toolbar />
    </>
  )
}
