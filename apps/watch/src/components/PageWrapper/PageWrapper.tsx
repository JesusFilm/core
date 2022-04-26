import Image from 'next/image'
import React, { ReactElement } from 'react'
import AppBar from '@mui/material/AppBar'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import IconButton from '@mui/material/IconButton'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Toolbar from '@mui/material/Toolbar'
import ListIcon from '@mui/icons-material/List'
import MenuIcon from '@mui/icons-material/Menu'
import SearchIcon from '@mui/icons-material/Search'
import logo from '../../../public/taskbar-icon.svg'

export function PageWrapper(): React.ReactElement {
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
      <AppBar position="fixed">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer('left', true)}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Image src={logo} width="60" height="40" alt="Watch Logo" />
          <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'flex' } }}>
            {menuItems.map((menuItem) => (
              <Button
                key={menuItem}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {menuItem}
              </Button>
            ))}
          </Box>
          <Box>
            <IconButton
              color="inherit"
              edge="start"
              onClick={toggleDrawer('left', true)}
            >
              <SearchIcon />
            </IconButton>
            <Button sx={{ my: 2, color: 'white' }}>Rus</Button>
          </Box>
        </Toolbar>
      </AppBar>
      <SwipeableDrawer
        anchor={'left'}
        open={state.left}
        onClose={toggleDrawer('left', false)}
        onOpen={toggleDrawer('left', true)}
      >
        {list()}
      </SwipeableDrawer>
    </Box>
  )
}
