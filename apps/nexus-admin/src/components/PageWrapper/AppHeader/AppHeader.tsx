import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import Menu1Icon from '@core/shared/ui/icons/Menu1'

import { usePageWrapperStyles } from '../utils/usePageWrapperStyles'

export interface MainBodyContainerProps {
  onClick: () => void
}

export function AppHeader({ onClick }: MainBodyContainerProps): ReactElement {
  const { toolbar } = usePageWrapperStyles()

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
            >
              <Menu1Icon sx={{ color: 'background.paper' }} />
            </IconButton>
            <Stack
              direction="row"
              flexGrow={1}
              justifyContent="center"
              sx={{ ml: -9 }}
            >
              <Typography
                variant="h4"
                sx={{
                  color: 'primary.main'
                }}
              >
                N
              </Typography>
            </Stack>
          </Stack>
        </Toolbar>
      </AppBar>
    </Box>
  )
}
