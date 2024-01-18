import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'

import Menu1Icon from '@core/shared/ui/icons/Menu1'

import taskbarIcon from '../../../../public/taskbar-icon.svg'
import { usePageWrapperStyles } from '../utils/usePageWrapperStyles'

export interface MainBodyContainerProps {
  onClick: () => void
}

export function AppHeader({ onClick }: MainBodyContainerProps): ReactElement {
  const { toolbar } = usePageWrapperStyles()
  const router = useRouter()

  return (
    <Box
      id="app-header"
      sx={{ display: { md: 'none' } }}
      data-testid="AppHeader"
    >
      <AppBar
        role="banner"
        position="fixed"
        sx={{
          display: { xs: 'flex', md: 'none' },
          backgroundColor: 'secondary.dark'
        }}
      >
        <Toolbar variant={toolbar.variant}>
          <Stack direction="row" flexGrow={1} alignItems="center">
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={onClick}
              sx={{
                display: router.route.includes('/journeys/') ? 'none' : 'flex'
              }}
            >
              <Menu1Icon sx={{ color: 'background.paper' }} />
            </IconButton>
            <Stack
              direction="row"
              flexGrow={1}
              justifyContent="center"
              sx={{ ml: -9 }}
            >
              <Image
                src={taskbarIcon}
                width={32}
                height={32}
                alt="Next Steps"
              />
            </Stack>
          </Stack>
        </Toolbar>
      </AppBar>
    </Box>
  )
}
