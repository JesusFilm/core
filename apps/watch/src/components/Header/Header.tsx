import { ReactElement, useState, KeyboardEvent, MouseEvent } from 'react'
import Container from '@mui/material/Container'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Image from 'next/image'
import NextLink from 'next/link'

import logo from '../../../public/header-logo.svg'
import { HeaderMenuPanel } from './HeaderMenuPanel'

export function Header(): ReactElement {
  const [state, setState] = useState({
    top: false,
    left: false,
    bottom: false,
    right: false
  })

  const toggleDrawer =
    (anchor: string, open: boolean) => (event: KeyboardEvent | MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as KeyboardEvent).key === 'Tab' ||
          (event as KeyboardEvent).key === 'Shift')
      ) {
        return
      }

      setState({ ...state, [anchor]: open })
    }

  return (
    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2 }}>
      <Container maxWidth="xxl" disableGutters>
        <AppBar
          sx={{ background: 'transparent', boxShadow: 'none', p: 4 }}
          position="static"
        >
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <NextLink href="/" passHref>
              <a>
                <Image
                  src={logo}
                  width="160"
                  height="40"
                  alt="Watch Logo"
                  style={{ cursor: 'pointer' }}
                />
              </a>
            </NextLink>
            <Stack spacing={0.5} direction="row">
              <IconButton
                color="inherit"
                aria-label="open header menu"
                edge="start"
                onClick={toggleDrawer('top', true)}
              >
                <MenuIcon />
              </IconButton>
            </Stack>
          </Toolbar>
        </AppBar>
        <SwipeableDrawer
          anchor="top"
          open={state.top}
          onClose={toggleDrawer('top', false)}
          onOpen={toggleDrawer('top', true)}
        >
          <HeaderMenuPanel toggleDrawer={toggleDrawer} />
        </SwipeableDrawer>
      </Container>
    </Box>
  )
}
