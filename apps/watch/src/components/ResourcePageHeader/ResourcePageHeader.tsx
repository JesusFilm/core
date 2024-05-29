import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

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
  // const [buttonClicked, setButtonClicked] = useState(false)
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
      {/* <Button onClick={() => setButtonClicked(true)}>{t('Click Me')}</Button> */}
    </>
  )
}

// TODO:
// Refactor out app bar and tab buttons x
// add button/component below tab buttons for testing x
// create function which will show breadcrumbs if testComponent is clicked x
// create function which navigates back to main page if breadcrumb is clicked x

export function ResourcePageHeader(): ReactElement {
  const [selectedTab, setSelectedTab] = useState('journeys')
  const [testButtonClicked, setTestButtonClicked] = useState(false)
  console.log(testButtonClicked)
  function handleTabChange(_event, value: string): void {
    setSelectedTab(value)
    setTestButtonClicked(false)
    // add logic for changing nextlink to selected tab value
  }

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
        <ResourceTabButtons
          selectedTab={selectedTab}
          handleTabChange={handleTabChange}
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
