import LanguageIcon from '@mui/icons-material/Language'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { User } from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import Menu1Icon from '@core/shared/ui/icons/Menu1'

import taskbarIcon from '../../../../public/taskbar-icon.svg'
import { LanguageSwitcher } from '../../LanguageSwitcher'
import { usePageWrapperStyles } from '../utils/usePageWrapperStyles'

export interface MainBodyContainerProps {
  onClick: () => void
  user?: User
}

export function AppHeader({
  onClick,
  user
}: MainBodyContainerProps): ReactElement {
  const { toolbar } = usePageWrapperStyles()
  const [open, setOpen] = useState(false)
  const { i18n } = useTranslation('apps-journeys-admin')
  const currentLanguageCode = (i18n?.language ?? '').slice(-2).toUpperCase()

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
          <Stack direction="row" alignItems="center" width="100%">
            <Stack direction="row" flexGrow={1} justifyContent="left">
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="open drawer"
                onClick={onClick}
              >
                <Menu1Icon sx={{ color: 'background.paper' }} />
              </IconButton>
            </Stack>
            <Stack direction="row" flexGrow={1} justifyContent="center">
              <Image
                src={taskbarIcon}
                width={32}
                height={32}
                alt="Next Steps"
              />
            </Stack>
            <Stack direction="row" flexGrow={1} justifyContent="right">
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                onClick={() => setOpen(true)}
                aria-label="language"
                sx={{
                  border: '1.5px solid white',
                  borderRadius: 2,
                  height: '25px',
                  width: '52px'
                }}
              >
                <LanguageIcon
                  sx={{ fontSize: '12.36px', color: 'background.paper', mr: 1 }}
                />
                <Typography
                  sx={{
                    fontSize: '12px',
                    fontWeight: 600,
                    fontFamily: 'Montserrat'
                  }}
                >
                  {currentLanguageCode}
                </Typography>
              </IconButton>
            </Stack>
          </Stack>
          {open && (
            <LanguageSwitcher open={open} handleClose={() => setOpen(false)} />
          )}
        </Toolbar>
      </AppBar>
    </Box>
  )
}
