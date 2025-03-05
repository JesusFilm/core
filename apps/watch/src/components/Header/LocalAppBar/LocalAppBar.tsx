import MenuIcon from '@mui/icons-material/Menu'
import AppBar, { AppBarProps } from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Image from 'next/image'
import NextLink from 'next/link'
import { MouseEventHandler, ReactElement } from 'react'

import logo from '../assets/logo.svg'

interface LocalAppBarProps extends AppBarProps {
  onMenuClick: MouseEventHandler<HTMLButtonElement>
  hideSpacer?: boolean
}

export function LocalAppBar({
  onMenuClick,
  hideSpacer = false,
  ...props
}: LocalAppBarProps): ReactElement {
  return (
    <AppBar
      data-testid="Header"
      position="static"
      {...props}
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        background: 'transparent',
        color: hideSpacer ? 'background.default' : 'inherit',
        boxShadow: 'none',
        px: 8,
        pt: { xs: 0, sm: 10 },
        width: '100%',
        height: { xs: 100, sm: 159 },
        ...props.sx
      }}
    >
      <Container maxWidth="xl" disableGutters>
        <Toolbar disableGutters>
          <Grid
            container
            sx={{
              display: 'grid',
              alignItems: 'center',
              gridTemplateColumns: 'auto 1fr auto'
            }}
          >
            <Grid item sx={{ gridRow: 1 }}>
              <Box sx={{ width: { xs: 126, sm: 186 } }}>
                <NextLink
                  passHref
                  legacyBehavior
                  href="https://www.jesusfilm.org/"
                >
                  <Box data-testid="WatchLogo">
                    <Image
                      src={logo}
                      alt="Watch Logo"
                      style={{
                        cursor: 'pointer',
                        maxWidth: '100%',
                        height: 'auto',
                        width: 'auto'
                      }}
                    />
                  </Box>
                </NextLink>
              </Box>
            </Grid>
            <Grid item sx={{ gridRow: 1, gridColumn: 3 }}>
              <Box data-testid="MenuBox">
                <IconButton
                  color="inherit"
                  aria-label="open header menu"
                  edge="start"
                  onClick={onMenuClick}
                  sx={{ width: 40, height: 40, pr: 0 }}
                >
                  <MenuIcon />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
