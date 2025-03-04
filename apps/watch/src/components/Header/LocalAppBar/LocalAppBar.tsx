import MenuIcon from '@mui/icons-material/Menu'
import AppBar, { AppBarProps } from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import Image from 'next/image'
import NextLink from 'next/link'
import { MouseEventHandler, ReactElement } from 'react'

import logo from '../assets/logo.svg'

interface LocalAppBarProps extends AppBarProps {
  showDivider?: boolean
  onMenuClick: MouseEventHandler<HTMLButtonElement>
}

export function LocalAppBar({
  onMenuClick,
  showDivider = false,
  ...props
}: LocalAppBarProps): ReactElement {
  return (
    <AppBar
      position="static"
      {...props}
      sx={{
        px: 4,
        pb: showDivider ? 0 : 0,
        pt: { xs: 0, sm: 6 },
        justifyContent: 'center',
        color: 'text.primary',
        width: '100%',
        height: { xs: 100, sm: 159 },
        ...props.sx
      }}
    >
      <Container maxWidth="xl" disableGutters>
        <Toolbar>
          <Grid
            container
            sx={{
              display: 'grid',
              alignItems: 'center',
              gridTemplateColumns: 'auto 1fr auto'
            }}
          >
            <Grid item sx={{ gridRow: 1 }}>
              <Box
                sx={{
                  width: {
                    xs: 126,
                    sm: 186
                  }
                }}
              >
                <NextLink href="/watch">
                  <Box sx={{ display: 'flex' }}>
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
            <Grid
              item
              sx={{
                gridRow: 1,
                gridColumn: 3
              }}
            >
              <Box data-testid="MenuBox">
                <IconButton
                  color="inherit"
                  aria-label="open header menu"
                  edge="start"
                  onClick={onMenuClick}
                >
                  <MenuIcon />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </Toolbar>
      </Container>
      {showDivider && (
        <Divider
          sx={{
            pt: 12,
            mx: '-16px'
          }}
          data-testid="AppBarDivider"
        />
      )}
    </AppBar>
  )
}
