import { useTheme } from '@mui/material'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
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

import { ResourceAppBar } from './ResourceAppBar'
import { ResourceTabButtons } from './ResourceTabButtons'

interface TestComponentProps {
  selectedTab: string
  buttonClicked: boolean
  setButtonClicked: (boolean) => void
}

function TestComponent({
  selectedTab,
  buttonClicked,
  setButtonClicked
}: TestComponentProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  const router = useRouter()
  return (
    <>
      {!buttonClicked ? (
        <>
          <Typography variant="h1" align="center">
            {t(`${selectedTab} page`)}
          </Typography>
          <Button onClick={() => setButtonClicked(true)}>
            {t(`Click me to open a ${selectedTab} element`)}
          </Button>
          <Typography variant="h2" align="center">
            {t(`url = '/${selectedTab}' `)}
          </Typography>
          <Typography variant="h2" align="center">
            {t(`${router.pathname}`)}
          </Typography>
        </>
      ) : (
        <>
          <Typography variant="h1" align="center">
            {t(`${selectedTab} single element`)}
          </Typography>
          <Button onClick={() => setButtonClicked(false)}>
            {t(`Click me to go back to main ${selectedTab} page`)}
          </Button>
          <Typography variant="h2" align="center">
            {t(`url = '/${selectedTab}/singleComponentId' `)}
          </Typography>
        </>
      )}
    </>
  )
}

interface NextLinkButtonsProps {
  selectedTab: string
  setSelectedTab: (string) => void
}

function NextLinkButtons({
  selectedTab,
  setSelectedTab
}: NextLinkButtonsProps): ReactElement {
  const { t } = useTranslation('apps-watch')
  //  const theme = useTheme()
  // console.log(theme.palette.primary.main)
  return (
    <>
      {/* <Stack flexDirection="row"> */}
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
        <NextLink href="/journeys" passHref legacyBehavior>
          <Button
            component="a"
            color="secondary"
            sx={{
              flexGrow: 1,
              textAlign: 'center',
              borderRadius: '40px !important',
              backgroundColor:
                selectedTab === 'journeys' ? 'lightgrey' : 'transparent'
              // color: (theme) => theme.palette.secondary.main
            }}
            onClick={() => setSelectedTab('journeys')}
            startIcon={<JourneysIcon />}
          >
            {t('Journeys')}
          </Button>
        </NextLink>
        <NextLink href="/videos" passHref legacyBehavior>
          <Button
            component="a"
            color="secondary"
            sx={{
              flexGrow: 1,
              textAlign: 'center',
              borderRadius: '40px !important',
              backgroundColor:
                selectedTab === 'videos' ? 'lightgrey' : 'transparent'
              // color: (theme) => theme.palette.secondary.main
            }}
            onClick={() => setSelectedTab('videos')}
            startIcon={<Play1Icon />}
          >
            {t('Videos')}
          </Button>
        </NextLink>
        <NextLink href="/strategies" passHref legacyBehavior>
          <Button
            component="a"
            color="secondary"
            sx={{
              flexGrow: 1,
              textAlign: 'center',
              borderRadius: '40px !important',
              backgroundColor:
                selectedTab === 'strategies' ? 'lightgrey' : 'transparent'
              // color: (theme) => theme.palette.secondary.main
            }}
            onClick={() => setSelectedTab('strategies')}
            startIcon={<BulbIcon />}
          >
            {t('Strategies')}
          </Button>
        </NextLink>
        <NextLink href="/calendar" passHref legacyBehavior>
          <Button
            component="a"
            color="secondary"
            sx={{
              flexGrow: 1,
              textAlign: 'center',
              borderRadius: '40px !important',
              backgroundColor:
                selectedTab === 'calendar' ? 'lightgrey' : 'transparent'
              // color: (theme) => theme.palette.secondary.main
            }}
            onClick={() => setSelectedTab('calendar')}
            startIcon={<Calendar1Icon />}
          >
            {t('Calendar')}
          </Button>
        </NextLink>
        <NextLink href="/apps" passHref legacyBehavior>
          <Button
            component="a"
            color="secondary"
            sx={{
              flexGrow: 1,
              textAlign: 'center',
              borderRadius: '40px !important',
              backgroundColor:
                selectedTab === 'apps' ? 'lightgrey' : 'transparent'
              // color: (theme) => theme.palette.secondary.main
            }}
            onClick={() => setSelectedTab('apps')}
            startIcon={<Grid1Icon />}
          >
            {t('Apps')}
          </Button>
        </NextLink>
      </Container>
      {/* </ThemeProvider> */}
      {/* </Stack> */}
    </>
  )
}

// TODO:
// Refactor out app bar and tab buttons x
// add button/component below tab buttons for testing x
// create function which will show breadcrumbs if testComponent is clicked x
// create function which navigates back to main page if breadcrumb is clicked x

// add nextlink functionality on breadcrumb, and handleTabchange function

// change toggle buttons into nextLinks(which have a button with 'a' component inside) x
// remove router logic from handleTabChange x
// create page for resourcepageheader, to deploy on watch
// use current pathname to highlight the selected button (eg '/journeys' pathname should highlight journeys button)
// refactor nextLink buttons

// add nextLinks to toggle buttons
// try to make buttons go full width of screen

export function ResourcePageHeader(): ReactElement {
  const [selectedTab, setSelectedTab] = useState('journeys')
  const [testButtonClicked, setTestButtonClicked] = useState(false)
  // console.log(testButtonClicked)
  // console.log(selectedTab)

  // const router = useRouter()
  // console.log(router.pathname)
  // const handleTabChange = async (_event, value: string): Promise<void> => {
  //   // console.log(value)
  //   setSelectedTab(value)
  //   setTestButtonClicked(false)
  //   // if (value !== null) {
  //   //   setSelectedTab(value)
  //   //   // console.log('pushing path')
  //   //   try {
  //   //     await router.push(`/${value}`)
  //   //     console.log(router.pathname)
  //   //   } catch (e) {
  //   //     console.log(e)
  //   //   }
  //   }
  //   // console.log(value, ': ', router.pathname)
  //   // add logic for changing nextlink to selected tab value
  // }

  // function handleTabChange(_event, value: string): void {
  //   console.log('handle tab change')
  //   setSelectedTab(value)
  //   setTestButtonClicked(false)
  //   // add logic for changing nextlink to selected tab value
  // }

  return (
    <>
      <Stack
        flexDirection="column"
        justifyContent="space-between"
        data-testid="stack"
      >
        <ResourceAppBar
          selectedTab={selectedTab}
          showBreadcrumb={testButtonClicked}
          setTestButtonClicked={setTestButtonClicked}
        />
        {/* <ResourceTabButtons
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
        /> */}
        <NextLinkButtons
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
        />
        <TestComponent
          selectedTab={selectedTab}
          buttonClicked={testButtonClicked}
          setButtonClicked={setTestButtonClicked}
        />
      </Stack>
    </>
  )
}
