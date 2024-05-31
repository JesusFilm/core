import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import { ResourceAppBar } from './ResourceAppBar'
import { ResourceNextLinkButtons } from './ResourceNextLinkButtons'
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

// TODO:
// Refactor out app bar and tab buttons x
// add button/component below tab buttons for testing x
// create function which will show breadcrumbs if testComponent is clicked x
// create function which navigates back to main page if breadcrumb is clicked x

// add nextlink functionality on breadcrumb, and handleTabchange function

// change toggle buttons into nextLinks(which have a button with 'a' component inside) x
// remove router logic from handleTabChange x
// refactor nextLink buttons x
// create page for resourcepageheader, to deploy on watch x
// use current pathname to highlight the selected button (eg '/journeys' pathname should highlight journeys button)

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
        <ResourceNextLinkButtons
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
