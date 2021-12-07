import { AppBar, IconButton, Toolbar, Typography } from '@mui/material'
import { ReactElement } from 'react'
import { ChevronLeft } from '@mui/icons-material'
import Link from 'next/link'

interface TopBarProps {
  slug: string
  title: string
}

export function TopBar({ slug, title }: TopBarProps): ReactElement {
  return (
    <>
      <AppBar position="fixed" color="default">
        <Toolbar variant="dense">
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
      <Toolbar variant="dense" />
    </>
  )
}
