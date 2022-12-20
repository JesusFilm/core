import {
  ReactElement,
  useState,
  KeyboardEvent,
  MouseEvent,
  forwardRef
} from 'react'
import Slide from '@mui/material/Slide'
import Container from '@mui/material/Container'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import Stack from '@mui/material/Stack'
import AppBar, { AppBarProps } from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Image from 'next/image'
import NextLink from 'next/link'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'
import useScrollTrigger from '@mui/material/useScrollTrigger'
import logo from '../../../public/header-logo.svg'
import { HeaderMenuPanel } from './HeaderMenuPanel'

interface HeaderProps {
  hideAbsoluteAppBar?: boolean
}

export function Header({ hideAbsoluteAppBar }: HeaderProps): ReactElement {
  const trigger = useScrollTrigger()
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

  const LocalAppBar = forwardRef<HTMLDivElement, AppBarProps>((props, ref) => {
    return (
      <AppBar
        position="absolute"
        {...props}
        sx={{
          background: 'transparent',
          boxShadow: 'none',
          p: 4,
          ...props.sx
        }}
        ref={ref}
      >
        <Container maxWidth="xxl" disableGutters>
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
        </Container>
      </AppBar>
    )
  })
  LocalAppBar.displayName = 'LocalAppBar'

  return (
    <>
      <Slide in={hideAbsoluteAppBar !== true}>
        <LocalAppBar />
      </Slide>
      <ThemeProvider
        themeName={ThemeName.website}
        themeMode={ThemeMode.dark}
        nested
      >
        <Slide in={trigger}>
          <LocalAppBar
            sx={{ backgroundColor: 'background.default' }}
            position="fixed"
          />
        </Slide>
      </ThemeProvider>
      <SwipeableDrawer
        anchor="top"
        open={state.top}
        onClose={toggleDrawer('top', false)}
        onOpen={toggleDrawer('top', true)}
      >
        <HeaderMenuPanel toggleDrawer={toggleDrawer} />
      </SwipeableDrawer>
    </>
  )
}
