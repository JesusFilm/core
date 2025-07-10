'use client'

import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import AppBar from '@mui/material/AppBar'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import { tabsClasses } from '@mui/material/Tabs'
import MuiToolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { ReactElement, useState } from 'react'

import minimalLogo from '../../../assets/minimal-logo.png'
import { MenuButton } from '../../../components/MenuButton'
import { ToggleColorMode } from '../../../components/ToggleColorMode'
import { getEnvironmentBannerHeight } from '../../../libs/environment'

import { SideMenuMobile } from './_SideMenuMobile'

const Toolbar = styled(MuiToolbar)({
  padding: '12px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'start',
  justifyContent: 'center',
  gap: '12px',
  flexShrink: 0,
  [`& ${tabsClasses.flexContainer}`]: {
    gap: '8px',
    p: '8px',
    pb: 0
  }
})

export function AppNavbar(): ReactElement {
  const [open, setOpen] = useState(false)
  const environmentBannerHeight = getEnvironmentBannerHeight()

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen)
  }

  return (
    <AppBar
      position="fixed"
      sx={{
        display: { xs: 'auto', md: 'none' },
        boxShadow: 0,
        bgcolor: 'background.paper',
        backgroundImage: 'none',
        borderBottom: '1px solid',
        borderColor: 'divider',
        top: `${environmentBannerHeight}px`
      }}
      data-testid="AppNavbar"
    >
      <Toolbar variant="regular">
        <Stack
          direction="row"
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            flexGrow: 1,
            width: '100%'
          }}
        >
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
            <Image
              src={minimalLogo}
              alt="Jesus Film Project"
              width={37}
              height={37}
            />
            <Typography
              variant="h4"
              component="h1"
              sx={{ color: 'text.primary' }}
            >
              Nexus
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <ToggleColorMode />
            <MenuButton aria-label="menu" onClick={toggleDrawer(true)}>
              <MenuRoundedIcon />
            </MenuButton>
          </Stack>
          <SideMenuMobile open={open} toggleDrawer={toggleDrawer} />
        </Stack>
      </Toolbar>
    </AppBar>
  )
}
