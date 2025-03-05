import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MuiMenu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import compact from 'lodash/compact'
import { useRouter } from 'next/compat/router'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { type MouseEvent, type ReactElement, useState } from 'react'

import { useFlags } from '@core/shared/ui/FlagsProvider'
import ChervonDownIcon from '@core/shared/ui/icons/ChevronDown'
import JourneysIcon from '@core/shared/ui/icons/Journeys'
import Play1Icon from '@core/shared/ui/icons/Play1'
import TerminalIcon from '@core/shared/ui/icons/Terminal'

export function HeaderTabButtons(): ReactElement {
  const { strategies, journeys } = useFlags()
  const { t } = useTranslation('apps-watch')
  const router = useRouter()

  const headerItems = compact([
    strategies
      ? { label: t('Resources'), icon: <TerminalIcon />, href: '/resources' }
      : undefined,
    journeys
      ? { label: t('Journeys'), icon: <JourneysIcon />, href: '/journeys' }
      : undefined,
    { label: t('Videos'), icon: <Play1Icon />, href: '/watch' }
  ])

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  function handleShowMenu(event: MouseEvent<HTMLElement>): void {
    setAnchorEl(event.currentTarget)
  }
  function handleCloseMenu(): void {
    setAnchorEl(null)
  }

  const buttonLabel =
    headerItems.find((link) => router?.pathname?.startsWith(link.href))
      ?.label ?? ''

  return headerItems.length > 1 ? (
    <>
      <Box
        data-testid="HeaderTabButtons"
        sx={{
          display: { xs: 'none', lg: 'flex' },
          width: '100%',
          height: '48px',
          justifyContent: 'space-between',
          gap: { sm: '8px', md: '12px' },
          alignItems: 'center'
        }}
      >
        {headerItems.map(({ label, icon, href }) => (
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
                borderColor:
                  (router?.pathname?.startsWith(href) ?? false)
                    ? (theme) => theme.palette.primary.main
                    : 'transparent',
                py: { sm: 1 },
                px: { sm: 2 },
                fontSize: { sm: '0.875rem', md: '1rem' }
              }}
              startIcon={icon}
            >
              {label}
            </Button>
          </NextLink>
        ))}
      </Box>
      <Box
        sx={{
          top: '-10px',
          pr: { md: '20px' },
          display: { xs: 'flex', lg: 'none' },
          justifyContent: 'center',
          width: '100%'
        }}
      >
        <Button
          data-testid="DropDownButton"
          color="inherit"
          startIcon={<Play1Icon />}
          endIcon={<ChervonDownIcon />}
          sx={{
            borderRadius: '40px !important',
            borderWidth: '2px',
            borderStyle: 'solid',
            borderColor: 'text.disabled',
            backgroundColor: 'background.default',
            '&:hover': { backgroundColor: 'background.default' },
            height: '48px'
          }}
          onClick={handleShowMenu}
        >
          {buttonLabel}
        </Button>
      </Box>
      <MuiMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        keepMounted
        slotProps={{ paper: { style: { width: anchorEl?.clientWidth } } }}
      >
        {headerItems.map(({ label, icon, href }) => (
          <NextLink href={href} passHref legacyBehavior key={label}>
            <MenuItem
              onClick={handleCloseMenu}
              selected={router?.pathname?.startsWith(href)}
            >
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primaryTypographyProps={{ variant: 'h6' }}>
                {t(label)}
              </ListItemText>
            </MenuItem>
          </NextLink>
        ))}
      </MuiMenu>
    </>
  ) : (
    <></>
  )
}
