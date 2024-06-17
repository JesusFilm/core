import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MuiMenu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { MouseEvent, ReactElement, useState } from 'react'

import Calendar2Icon from '@core/shared/ui/icons/Calendar2'
import ChervonDownIcon from '@core/shared/ui/icons/ChevronDown'
import Grid1Icon from '@core/shared/ui/icons/Grid1'
import JourneysIcon from '@core/shared/ui/icons/Journeys'
import Play1Icon from '@core/shared/ui/icons/Play1'
import TerminalIcon from '@core/shared/ui/icons/Terminal'

// const [showAllButtons] = useFlags() ... Launchdarkly flag to control which buttons to display

const HeaderTabButtonsData = [
  { label: 'Strategies', icon: <TerminalIcon />, href: '/strategies' },
  { label: 'Journeys', icon: <JourneysIcon />, href: '/journeys' },
  { label: 'Videos', icon: <Play1Icon />, href: '/watch' },
  { label: 'Calendar', icon: <Calendar2Icon />, href: '/calendar' },
  { label: 'Products', icon: <Grid1Icon />, href: '/products' }
] // filter out this list to only use the ones with the launchdarkly flag set to true

export function HeaderTabButtons(): ReactElement {
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
      HeaderTabButtonsData.find((link) => link.href === currentHref)?.label ??
      ''
    )
  }

  return (
    <>
      <Box
        data-testid="HeaderTabButtons"
        sx={{
          display: { xs: 'none', lg: 'flex' },
          pr: { xl: '20px' },
          width: '100%',
          height: '48px',
          justifyContent: 'space-between',
          gap: '12px' // todo: reduce to 4px on smaller devices
        }}
      >
        {HeaderTabButtonsData.map(({ label, icon, href }) => (
          <NextLink href={href} passHref legacyBehavior key={label}>
            <Button
              data-testid={`${label}Button`}
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
              }}
              startIcon={icon}
            >
              {t(label)}
            </Button>
          </NextLink>
        ))}
      </Box>
      <Box
        // data-testid="DropDownButton"
        sx={{
          top: '-10px',
          pr: { md: '20px' },
          display: { xs: 'flex', lg: 'none' },
          // display: 'flex',
          justifyContent: 'center',
          width: '100%',
          position: { xs: 'absolute', md: 'initial' }
        }}
      >
        <Button
          data-testid="DropDownButton"
          color="inherit"
          startIcon={<Play1Icon />}
          endIcon={<ChervonDownIcon />}
          sx={{
            // display: { xs: 'flex', lg: 'none' },
            borderRadius: '40px !important',
            borderWidth: '2px',
            borderStyle: 'solid',
            borderColor: 'text.disabled',
            backgroundColor: 'background.default',
            '&:hover': {
              backgroundColor: 'background.default'
            },
            height: '48px'
          }}
          onClick={handleShowMenu}
        >
          {t(getButtonName())}
        </Button>
      </Box>
      <MuiMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        keepMounted
        slotProps={{
          paper: {
            style: {
              width: anchorEl?.clientWidth
            }
          }
        }}
      >
        {HeaderTabButtonsData.map(({ label, icon, href }) => (
          <NextLink href={href} passHref legacyBehavior key={label}>
            <MenuItem
              onClick={handleCloseMenu}
              selected={router.pathname.startsWith(href)}
            >
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText>{t(label)}</ListItemText>
            </MenuItem>
          </NextLink>
        ))}
      </MuiMenu>
    </>
  )
}

// todo:
// move button into it's own line  to match design
//  - use the correct divider line
// create tablet design
