import Image from 'next/image'
import React, { ReactElement } from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import IconButton from '@mui/material/IconButton'
import LanguageIcon from '@mui/icons-material/Language'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Toolbar from '@mui/material/Toolbar'
import ListIcon from '@mui/icons-material/List'
import MenuIcon from '@mui/icons-material/Menu'
import SearchIcon from '@mui/icons-material/Search'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import logo from '../../../public/taskbar-icon.svg'
import { useLanguage } from '../../libs/languageContext/LanguageContext'

export function PageWrapper(): React.ReactElement {
  const languageContext = useLanguage()
  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false
  })

  const toggleDrawer =
    (anchor: string, open: boolean) =>
    (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return
      }

      setState({ ...state, [anchor]: open })
    }

  const menuItems = ['About', 'Contact', 'Collections']

  const list = (): ReactElement => (
    <Box
      sx={{ width: '240px' }}
      role="presentation"
      onClick={toggleDrawer('left', false)}
      onKeyDown={toggleDrawer('left', false)}
    >
      <List>
        {menuItems.map((text, index) => (
          <ListItem button key={text}>
            <ListItemIcon>
              {index % 2 === 0 ? <PlayArrowIcon /> : <ListIcon />}
            </ListItemIcon>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="absolute"
        sx={{ background: 'transparent', boxShadow: 'none' }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Image src={logo} width="60" height="40" alt="Watch Logo" />
          <Typography variant="h6">Jesus Film Project</Typography>
          <Stack spacing={0.5} direction="row">
            <IconButton
              color="inherit"
              edge="start"
              onClick={toggleDrawer('left', true)}
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
              onClick={toggleDrawer('left', true)}
            >
              <MenuIcon />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>
      <SwipeableDrawer
        anchor={'right'}
        open={state.left}
        onClose={toggleDrawer('left', false)}
        onOpen={toggleDrawer('left', true)}
      >
        {list()}
      </SwipeableDrawer>
    </Box>
  )
}
