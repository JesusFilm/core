import LanguageIcon from '@mui/icons-material/Language'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import Home4Icon from '@core/shared/ui/icons/Home4'

import taskbarIcon from '../../../../public/taskbar-icon.svg'
import { LanguageSwitcher } from '../../LanguageSwitcher'
import { usePageWrapperStyles } from '../../PageWrapper/utils/usePageWrapperStyles'

export function GuestCustomizeHeader(): ReactElement {
  const router = useRouter()
  const { toolbar } = usePageWrapperStyles()
  const [open, setOpen] = useState(false)
  const { i18n } = useTranslation('apps-journeys-admin')
  const currentLanguageCode = (i18n?.language ?? '').slice(0, 2)

  function handleHomeClick(): void {
    void router.push('/')
  }

  function handleLanguageOpen(): void {
    setOpen(true)
  }

  function handleLanguageClose(): void {
    setOpen(false)
  }

  return (
    <Box sx={{ display: { md: 'none' } }} data-testid="GuestCustomizeHeader">
      <AppBar
        role="banner"
        position="fixed"
        sx={{
          display: { xs: 'flex', md: 'none' },
          backgroundColor: 'background.paper'
        }}
        elevation={0}
      >
        <Toolbar variant={toolbar.variant}>
          <Stack direction="row" alignItems="center" width="100%">
            <Stack direction="row" flexGrow={1} justifyContent="left">
              <IconButton
                size="large"
                edge="start"
                onClick={handleHomeClick}
                aria-label="home"
              >
                <Home4Icon sx={{ color: 'secondary.dark' }} />
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
                onClick={handleLanguageOpen}
                aria-label="language"
                sx={{
                  border: '1.75px solid',
                  borderColor: 'secondary.dark',
                  borderRadius: 2.25,
                  height: 25,
                  width: 52
                }}
              >
                <LanguageIcon
                  sx={{ fontSize: 13, color: 'secondary.dark', mr: 1 }}
                />
                <Typography
                  variant="overline2"
                  sx={{ fontSize: 12, color: 'secondary.dark' }}
                >
                  {currentLanguageCode}
                </Typography>
              </IconButton>
            </Stack>
          </Stack>
          {open && (
            <LanguageSwitcher open={open} handleClose={handleLanguageClose} />
          )}
        </Toolbar>
      </AppBar>
    </Box>
  )
}
