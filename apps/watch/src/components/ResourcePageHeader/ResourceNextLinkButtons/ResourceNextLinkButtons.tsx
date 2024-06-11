import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import BulbIcon from '@core/shared/ui/icons/Bulb'
import Calendar1Icon from '@core/shared/ui/icons/Calendar1'
import Calendar2Icon from '@core/shared/ui/icons/Calendar2'
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
          height: '48px',
          justifyContent: 'space-between',
          gap: '12px' // todo: reduce to 4px on smaller devices
        }}
      >
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
                // backgroundColor: router.pathname.startsWith(href)
                //   ? 'lightgrey'
                //   : 'transparent',
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
      </Container>
      {/* </ThemeProvider> */}
    </>
  )
}
