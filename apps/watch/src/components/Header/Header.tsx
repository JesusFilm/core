import { ReactElement, useState, KeyboardEvent, MouseEvent } from 'react'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import IconButton from '@mui/material/IconButton'
import LanguageIcon from '@mui/icons-material/Language'
import MenuIcon from '@mui/icons-material/Menu'
import SearchIcon from '@mui/icons-material/Search'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Image from 'next/image'

import logo from '../../../public/taskbar-icon.svg'
import { useLanguage } from '../../libs/languageContext/LanguageContext'
import { HeaderMenuPanel } from './HeaderMenuPanel'

export function Header(): ReactElement {
  const languageContext = useLanguage()
  const [state, setState] = useState({
    top: false,
    left: false,
    bottom: false,
    right: false
  })

  const toggleMenuPanel =
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

  // update header to design
  return (
    <>
      <AppBar
        position="relative"
        sx={{ background: 'transparent', boxShadow: 'none' }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Image src={logo} width="60" height="40" alt="Watch Logo" />
          <Typography variant="h6">Jesus Film Project</Typography>
          <Stack spacing={0.5} direction="row">
            <IconButton
              color="inherit"
              edge="start"
              onClick={toggleMenuPanel('left', true)}
            >
              <SearchIcon />
            </IconButton>
            <Button color="inherit">
              <LanguageIcon />
              &nbsp;
              {`${languageContext?.bcp47?.charAt(0).toUpperCase() ?? ''}${
                languageContext?.bcp47?.slice(1) ?? ''
              }`}
            </Button>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleMenuPanel('left', true)}
            >
              <MenuIcon />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>
      <SwipeableDrawer
        anchor="right"
        open={state.left}
        onClose={toggleMenuPanel('left', false)}
        onOpen={toggleMenuPanel('left', true)}
      >
        <HeaderMenuPanel toggleMenuPanel={toggleMenuPanel} />
      </SwipeableDrawer>
    </>
  )
}
