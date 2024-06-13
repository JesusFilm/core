import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MuiMenu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { MouseEvent, ReactElement, useState } from 'react'

import BulbIcon from '@core/shared/ui/icons/Bulb'
import Calendar1Icon from '@core/shared/ui/icons/Calendar1'
import Calendar2Icon from '@core/shared/ui/icons/Calendar2'
import ChervonDownIcon from '@core/shared/ui/icons/ChevronDown'
import Grid1Icon from '@core/shared/ui/icons/Grid1'
import JourneysIcon from '@core/shared/ui/icons/Journeys'
import Play1Icon from '@core/shared/ui/icons/Play1'
import TerminalIcon from '@core/shared/ui/icons/Terminal'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

interface ResourceNextLinkButtonsProps {
  selectedTab: string
  setSelectedTab: (string) => void
}

const ResourceNextLinkButtonsData = [
  { label: 'Strategies', icon: <TerminalIcon />, href: '/strategies' },
  { label: 'Journeys', icon: <JourneysIcon />, href: '/journeys' },
  { label: 'Videos', icon: <Play1Icon />, href: '/watch' },
  { label: 'Calendar', icon: <Calendar2Icon />, href: '/calendar' },
  { label: 'Products', icon: <Grid1Icon />, href: '/products' }
]

export function ResourceNextLinkButtons(): ReactElement {
  //   {
  //   selectedTab,
  //   setSelectedTab
  // }: ResourceNextLinkButtonsProps
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const { t } = useTranslation('apps-watch')
  const router = useRouter()

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  function handleShowMenu(event: MouseEvent<HTMLElement>): void {
    setAnchorEl(event.currentTarget)
  }
  function handleCloseMenu(): void {
    setAnchorEl(null)
  }

  function getButtonName(): string {
    const currentHref = router.pathname
    return (
      ResourceNextLinkButtonsData.find((link) => link.href === currentHref)
        ?.label ?? ''
    )
  }

  return (
    <>
      {/* <ThemeProvider themeName={ThemeName.website} themeMode={ThemeMode.dark}> */}
      {/* <Container
        maxWidth="xxl"
        disableGutters */}
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          height: '48px',
          justifyContent: 'space-between',
          gap: '12px' // todo: reduce to 4px on smaller devices
        }}
      >
        {smUp ? (
          <>
            {ResourceNextLinkButtonsData.map(({ label, icon, href }) => (
              <NextLink href={href} passHref legacyBehavior key={label}>
                <Button
                  component="a"
                  color="inherit"
                  sx={{
                    flexGrow: 1,
                    textAlign: 'center',
                    borderRadius: '40px !important',
                    border: '2px solid',
                    borderColor: router.pathname.startsWith(href)
                      ? 'red'
                      : 'transparent'
                    // borderColor: 'black'

                    // color: (theme) => theme.palette.secondary.main
                  }}
                  // onClick={() => setSelectedTab(label.toLowerCase())}
                  startIcon={icon}
                >
                  {t(label)}
                </Button>
              </NextLink>
            ))}
          </>
        ) : (
          <>
            <Button
              color="inherit"
              startIcon={<Play1Icon />}
              endIcon={<ChervonDownIcon />}
              sx={{ borderRadius: '40px !important', border: '2px solid red' }}
              onClick={handleShowMenu}
            >
            {t(getButtonName())}
            </Button>
            <MuiMenu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
              keepMounted
            >
              {ResourceNextLinkButtonsData.map(({ label, icon, href }) => (
                <NextLink href={href} passHref legacyBehavior key={label}>
                  <MenuItem onClick={handleCloseMenu}>
                    <ListItemIcon>{icon}</ListItemIcon>
                    <ListItemText>{t(label)}</ListItemText>
                  </MenuItem>
                </NextLink>
              ))}
              {/* <MenuItem onClick={handleCloseMenu}> {t('Journeys')}</MenuItem>
          <MenuItem onClick={handleCloseMenu}> {t('Stat')}</MenuItem>
          <MenuItem onClick={handleCloseMenu}> {t('Journeys')}</MenuItem> */}
            </MuiMenu>
          </>
        )}
      </Box>
      {/* </Container> */}
      {/* </ThemeProvider> */}
    </>
  )
}

// todo:
// move button into it's own line  to match design
// create tablet design
