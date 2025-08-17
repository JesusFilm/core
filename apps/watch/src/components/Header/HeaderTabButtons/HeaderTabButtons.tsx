import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MuiMenu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
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

import { LANGUAGE_MAPPINGS } from '../../../libs/localeMapping'

/**
 * Determines the correct Videos link based on the current URL query parameters.
 * For inner pages with language slugs, returns /watch/{languageSlug}
 * Otherwise returns /watch
 */
function getVideosLink(query: Record<string, string | string[]>): string {
  // Check all query values for language slugs
  const queryValues = Object.values(query).flat()

  // Find if there's a language slug in the query values
  for (const value of queryValues) {
    if (typeof value === 'string') {
      const cleanValue = value.replace(/\.html$/, '')
      const mapping = Object.values(LANGUAGE_MAPPINGS).find((m) =>
        m.languageSlugs.includes(cleanValue)
      )
      
      if (mapping) {
        // Found a language slug, return the watch path with that language
        return `/watch/${cleanValue}`
      }
    }
  }
  
  // No language slug found, return /watch
  return '/watch'
}

export function HeaderTabButtons(): ReactElement {
  const { strategies, journeys } = useFlags()
  const { t } = useTranslation('apps-watch')
  const router = useRouter()
  const videosLink = router?.query ? getVideosLink(router.query as Record<string, string | string[]>) : '/watch'

  const headerItems = compact([
    strategies
      ? {
          label: t('Resources', { lng: 'en' }),
          icon: <TerminalIcon />,
          href: '/resources'
        }
      : undefined,
    journeys
      ? {
          label: t('Journeys', { lng: 'en' }),
          icon: <JourneysIcon />,
          href: '/journeys'
        }
      : undefined,
    { label: t('Videos', { lng: 'en' }), icon: <Play1Icon />, href: videosLink }
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

  const buttonIcon = headerItems.find((link) =>
    router?.pathname?.startsWith(link.href)
  )?.icon ?? <Play1Icon />

  return headerItems.length > 1 ? (
    <>
      <Box
        data-testid="HeaderTabButtons"
        sx={{
          display: { xs: 'none', md: 'flex' },
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
          display: { xs: 'flex', md: 'none' },
          justifyContent: 'center',
          width: '100%'
        }}
      >
        <Button
          fullWidth
          data-testid="DropDownButton"
          color="inherit"
          onClick={handleShowMenu}
          sx={{
            borderRadius: '40px !important',
            borderWidth: '2px',
            borderStyle: 'solid',
            borderColor: 'text.disabled',
            backgroundColor: 'background.default',
            '&:hover': { backgroundColor: 'background.default' },
            height: '48px',
            position: 'relative'
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            width="100%"
          >
            {buttonIcon}
            <Typography variant="inherit">{buttonLabel}</Typography>
            <ChervonDownIcon data-testid="ChevronDownIcon" />
          </Stack>
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
              <Stack direction="row" alignItems="center" width="100%" px={2.5}>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{
                    variant: 'h6',
                    sx: {
                      textAlign: 'center'
                    }
                  }}
                />
                <Box sx={{ width: 30 }} />
              </Stack>
            </MenuItem>
          </NextLink>
        ))}
      </MuiMenu>
    </>
  ) : (
    <></>
  )
}
