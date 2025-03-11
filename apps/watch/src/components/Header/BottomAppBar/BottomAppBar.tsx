import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Fade from '@mui/material/Fade'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import { ReactElement } from 'react'

import { HeaderTabButtons } from '../HeaderTabButtons'

interface BottomAppBarProps {
  lightTheme?: boolean
  bottomBarTrigger?: boolean
  shouldFade?: boolean
}

export function BottomAppBar({
  lightTheme = true,
  bottomBarTrigger = false,
  shouldFade = false
}: BottomAppBarProps): ReactElement {
  const lightStyles = {
    backgroundImage:
      'linear-gradient(rgb(255 255 255 / 60%), rgb(255 255 255 / 26%))',
    backdropFilter: 'blur(20px) brightness(1.1)',
    '-webkit-backdrop-filter': 'blur(20px) brightness(1.1)'
  }

  const darkStyles = {
    backgroundImage: 'linear-gradient(rgb(0 0 0 / 60%), rgb(0 0 0 / 26%))',
    backdropFilter: 'blur(20px) brightness(0.9)',
    '-webkit-backdrop-filter': 'blur(20px) brightness(0.9)'
  }
  const appBarStyles = lightTheme ? lightStyles : darkStyles

  return (
    <Fade
      appear={false}
      in={shouldFade}
      style={{
        transitionDelay: shouldFade ? undefined : '2s',
        transitionDuration: '225ms'
      }}
      timeout={{ exit: 2225 }}
    >
      <Stack
        sx={{
          display: 'flex',
          justifyContent: 'center',
          height: 80,
          position: bottomBarTrigger ? 'fixed' : 'absolute',
          top: 0,
          width: '100%',
          zIndex: 3,
          background: 'transparent',
          '&::before': {
            content: "' '",
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            opacity: bottomBarTrigger ? 1 : 0,
            ...appBarStyles,
            transition: 'opacity 0.3s ease'
          }
        }}
      >
        <Container
          data-testid="HeaderBottomAppBar"
          maxWidth="xl"
          disableGutters
          sx={{
            px: 4,
            color: 'text.primary',
            background: 'transparent',
            boxShadow: 'none'
          }}
        >
          <Toolbar disableGutters>
            <Box sx={{ width: '100%' }}>
              <HeaderTabButtons />
            </Box>
          </Toolbar>
        </Container>
      </Stack>
    </Fade>
  )
}
