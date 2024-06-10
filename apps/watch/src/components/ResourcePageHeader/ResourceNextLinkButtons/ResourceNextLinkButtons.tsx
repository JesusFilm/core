import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import BulbIcon from '@core/shared/ui/icons/Bulb'
import Calendar1Icon from '@core/shared/ui/icons/Calendar1'
import Grid1Icon from '@core/shared/ui/icons/Grid1'
import JourneysIcon from '@core/shared/ui/icons/Journeys'
import Play1Icon from '@core/shared/ui/icons/Play1'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

interface ResourceNextLinkButtonsProps {
  selectedTab: string
  setSelectedTab: (string) => void
}

const ResourceNextLinkButtonsData = [
  { label: 'Journeys', icon: <JourneysIcon />, href: '/journeys' },
  { label: 'Videos', icon: <Play1Icon />, href: '/watch' },
  { label: 'Strategies', icon: <BulbIcon />, href: '/strategies' },
  { label: 'Calendar', icon: <Calendar1Icon />, href: '/calendar' },
  { label: 'Products', icon: <Grid1Icon />, href: '/products' }
]

export function ResourceNextLinkButtons({
  selectedTab,
  setSelectedTab
}: ResourceNextLinkButtonsProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const router = useRouter()
  return (
    <>
      {/* <ThemeProvider themeName={ThemeName.website} themeMode={ThemeMode.dark}> */}
      <Container
        maxWidth="xxl"
        disableGutters
        sx={{
          display: 'flex',
          width: '100%',
          justifyContent: 'space-between'
        }}
      >
        {ResourceNextLinkButtonsData.map(({ label, icon, href }) => (
          <NextLink href={href} passHref legacyBehavior key={label}>
            <Button
              component="a"
              color="secondary"
              sx={{
                flexGrow: 1,
                textAlign: 'center',
                borderRadius: '40px !important',
                backgroundColor: router.pathname.startsWith(href)
                  ? 'lightgrey'
                  : 'transparent'
                // color: (theme) => theme.palette.secondary.main
              }}
              onClick={() => setSelectedTab(label.toLowerCase())}
              startIcon={icon}
            >
              {t(label)}
            </Button>
          </NextLink>
        ))}
      </Container>
      {/* </ThemeProvider> */}
    </>
  )
}
