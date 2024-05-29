import MenuIcon from '@mui/icons-material/Menu'
import {
  Breadcrumbs,
  Link,
  ToggleButton,
  ToggleButtonGroup,
  useTheme
} from '@mui/material'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import React, { ReactElement, useState } from 'react'

import BulbIcon from '@core/shared/ui/icons/Bulb'
import Calendar1Icon from '@core/shared/ui/icons/Calendar1'
import Grid1Icon from '@core/shared/ui/icons/Grid1'
import JourneysIcon from '@core/shared/ui/icons/Journeys'
import Play1Icon from '@core/shared/ui/icons/Play1'
import SpaceVerticalIcon from '@core/shared/ui/icons/SpaceVertical'

import logo from '../Header/assets/logo.svg'

interface ResourceAppBarProps {
  selectedTab: string
}

function ResourceAppBar({ selectedTab }: ResourceAppBarProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  return (
    <AppBar
      position="relative"
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
          <Stack flexDirection="row">
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
            <Breadcrumbs sx={{ marginLeft: '20px' }}>
              <Link color="inherit" href="/" underline="none">
                {selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)}
              </Link>
            </Breadcrumbs>
          </Stack>
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

interface TabButtonsProps {
  selectedTab: string
  handleTabChange: (
    _event: React.MouseEvent<HTMLLIElement>,
    newTab: string
  ) => void
}

function TabButtons({
  selectedTab,
  handleTabChange
}: TabButtonsProps): ReactElement {
  const theme = useTheme()
  console.log(theme.spacing(2))
  const CustomToggleButton = styled(ToggleButton)(({ theme }) => ({
    borderRadius: '40px !important',
    borderColor: 'transparent',
    // marginLeft: '8px !important',
    // '&.Mui-selected': {
    //   borderColor: theme.palette.primary.main
    // },
    '&:not(:first-of-type)': {
      borderTopLeftRadius: '40px',
      borderBottomLeftRadius: '40px'
    },
    '&:not(:last-of-type)': {
      borderTopRightRadius: '40px',
      borderBottomRightRadius: '40px'
    }

    // margin: '4px'
  }))
  const { t } = useTranslation('apps-watch')

  return (
    <>
      <Container maxWidth="xxl" disableGutters>
        {/* <Stack flexDirection="row" justifyContent="space-between">
          <Button startIcon={<JourneysIcon />}>{t('Journeys')}</Button>
          <Button startIcon={<Play1Icon />}>{t('Videos')}</Button>
          <Button startIcon={<BulbIcon />}>{t('Strategies')}</Button>
          <Button startIcon={<Calendar1Icon />}>{t('Calendar')}</Button>
          <Button startIcon={<Grid1Icon />}>{t('Apps')}</Button>
        </Stack> */}
        <ToggleButtonGroup
          value={selectedTab}
          onChange={handleTabChange}
          exclusive
          size="large"
          // sx={{ width: '100%' }}
        >
          <CustomToggleButton
            value="journeys"
            onClick={() => console.log('Journeys click')}
          >
            <Stack sx={{ ml: 1, mr: 2 }}>
              <JourneysIcon />
            </Stack>
            {t('journeys')}
          </CustomToggleButton>
          <CustomToggleButton value="videos">
            <Stack sx={{ ml: 1, mr: 2 }}>
              <Play1Icon />
            </Stack>
            {t('Videos')}
          </CustomToggleButton>
          <CustomToggleButton value="strategies">
            <Stack sx={{ ml: 1, mr: 2 }}>
              <BulbIcon />
            </Stack>
            {t('Strategies')}
          </CustomToggleButton>
          <CustomToggleButton value="calendar">
            <Stack sx={{ ml: 1, mr: 2 }}>
              <Calendar1Icon />
            </Stack>
            {t('Calendar')}
          </CustomToggleButton>
          <CustomToggleButton value="apps">
            <Stack sx={{ ml: 1, mr: 2 }}>
              <Grid1Icon />
            </Stack>
            {t('Apps')}
          </CustomToggleButton>
        </ToggleButtonGroup>
      </Container>
      {/* <Typography position="absolute">{t('Buttons')}</Typography> */}
    </>
  )
}

export function ResourcePageHeader(): ReactElement {
  // const { t } = useTranslation('apps-watch')
  const [selectedTab, setSelectedTab] = useState('journeys')
  function handleTabChange(_event, value: string): void {
    setSelectedTab(value)
  }

  return (
    <>
      <Stack
        flexDirection="column"
        justifyContent="space-between"
        data-testid="stack"
      >
        <ResourceAppBar selectedTab={selectedTab} />
        <TabButtons
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
        />
      </Stack>
    </>
  )
}
