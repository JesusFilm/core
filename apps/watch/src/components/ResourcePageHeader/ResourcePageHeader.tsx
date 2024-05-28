import MenuIcon from '@mui/icons-material/Menu'
import AppBar from '@mui/material/AppBar'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import BulbIcon from '@core/shared/ui/icons/Bulb'
import Calendar1Icon from '@core/shared/ui/icons/Calendar1'
import Grid1Icon from '@core/shared/ui/icons/Grid1'
import JourneysIcon from '@core/shared/ui/icons/Journeys'
import Play1Icon from '@core/shared/ui/icons/Play1'
import SpaceVerticalIcon from '@core/shared/ui/icons/SpaceVertical'

import logo from '../Header/assets/logo.svg'

function ResourceAppBar(): ReactElement {
  const { t } = useTranslation('apps-watch')
  return (
    <AppBar
      position="absolute"
      sx={{
        p: 4,
        background: 'transparent',
        boxShadow: 'none'
        // backgroundColor: 'red'
      }}
      data-testid="ResourceHeader"
    >
      <Container maxWidth="xxl" disableGutters>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <NextLink href="/" passHref legacyBehavior>
            <Image
              src={logo}
              width="160"
              height="40"
              alt="Watch Logo"
              style={{
                cursor: 'pointer',
                maxWidth: '100%',
                height: 'auto'
              }}
            />
          </NextLink>
          <Stack spacing={0.5} direction="row">
            <Button
              sx={{
                color: 'black',
                borderRadius: '50%',
                border: '2px red'
              }}
            >
              {t('Sign in')}
            </Button>
            <Button
              sx={{
                p: 2,
                //   borderStyle: 'solid',
                //   borderColor: 'red',
                //   borderWidth: 2,
                borderRadius: '80px',
                border: '2px solid red'
              }}
            >
              {t('Give now')}
            </Button>
            <IconButton
              color="secondary"
              aria-label="open header menu"
              edge="start"
              onClick={() => console.log('menu click')}
            >
              <MenuIcon />
            </IconButton>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  )
}

function TabButtons(): ReactElement {
  const { t } = useTranslation('apps-watch')
  return (
    <>
      <Stack flexDirection="row" justifyContent="center">
        <Button startIcon={<JourneysIcon />}>{t('Journeys')}</Button>
        <Button startIcon={<Play1Icon />}>{t('Videos')}</Button>
        <Button startIcon={<BulbIcon />}>{t('Strategies')}</Button>
        <Button startIcon={<Calendar1Icon />}>{t('Calendar')}</Button>
        <Button startIcon={<Grid1Icon />}>{t('Apps')}</Button>
      </Stack>
      {/* <Typography position="absolute">{t('Buttons')}</Typography> */}
    </>
  )
}

export function ResourcePageHeader(): ReactElement {
  // const { t } = useTranslation('apps-watch')
  return (
    <>
      {/* <AppBar
        position="absolute"
        sx={{
          p: 4,
          background: 'transparent',
          boxShadow: 'none'
          // backgroundColor: 'red'
        }}
        data-testid="ResourceHeader"
      >
        <Container maxWidth="xxl" disableGutters>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <NextLink href="/" passHref legacyBehavior>
              <Image
                src={logo}
                width="160"
                height="40"
                alt="Watch Logo"
                style={{
                  cursor: 'pointer',
                  maxWidth: '100%',
                  height: 'auto'
                }}
              />
            </NextLink>
            <Stack spacing={0.5} direction="row">
              <Button
                sx={{
                  color: 'black',
                  borderRadius: '50%',
                  border: '2px red'
                }}
              >
                {t('Sign in')}
              </Button>
              <Button
                sx={{
                  p: 2,
                  //   borderStyle: 'solid',
                  //   borderColor: 'red',
                  //   borderWidth: 2,
                  borderRadius: '80px',
                  border: '2px solid red'
                }}
              >
                {t('Give now')}
              </Button>
              <IconButton
                color="secondary"
                aria-label="open header menu"
                edge="start"
                onClick={() => console.log('menu click')}
              >
                <MenuIcon />
              </IconButton>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar> */}
      <Stack flexDirection="column" data-testid="stack">
        {/* <ResourceAppBar /> */}
        <TabButtons />
      </Stack>
    </>
  )
}
