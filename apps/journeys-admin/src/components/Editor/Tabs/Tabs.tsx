import { Box, Tabs as MuiTabs, Tab } from '@mui/material'
import { ReactElement, ReactNode, SyntheticEvent, useState } from 'react'
import { Attributes } from '../ControlPanel/Attributes'
import { Navigation } from '../ControlPanel/Navigation'
import { GetJourneyForEdit_journey_blocks_StepBlock as StepBlock } from '../../../../__generated__/GetJourneyForEdit'
import { TreeBlock } from '@core/journeys/ui'

interface TabPanelProps {
  children?: ReactNode
  value: number
  index: number
}

function TabPanel({
  children,
  value,
  index,
  ...other
}: TabPanelProps): ReactElement {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`journeys-admin-editor-tabpanel-${index}`}
      aria-labelledby={`journeys-admin-editor-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  )
}

function a11yProps(index: number): { id: string; 'aria-controls': string } {
  return {
    id: `journeys-admin-editor-tab-${index}`,
    'aria-controls': `journeys-admin-editor-tabpanel-${index}`
  }
}

export function Tabs(): ReactElement {
  const [selectedTab, setSelectedTab] = useState(0)
  const [selectedStep, setSelectedStep] = useState<TreeBlock<StepBlock>>()
  const [selectedBlock, setSelectedBlock] = useState<TreeBlock>()

  const handleChange = (
    _event: SyntheticEvent<Element, Event>,
    tab: number
  ): void => {
    setSelectedTab(tab)
  }

  const handleNavigationSelect = (step: TreeBlock<StepBlock>): void => {
    setSelectedStep(step)
    setSelectedBlock(step)
    setSelectedTab(1)
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <MuiTabs
          value={selectedTab}
          onChange={handleChange}
          aria-label="editor tabs"
        >
          <Tab label="Cards" {...a11yProps(0)} />
          <Tab label="Properties" {...a11yProps(1)} />
          <Tab label="Blocks" {...a11yProps(2)} />
        </MuiTabs>
      </Box>
      <TabPanel value={selectedTab} index={0}>
        <Navigation
          selected={selectedStep}
          onSelect={handleNavigationSelect}
          steps={[]}
        />
      </TabPanel>
      <TabPanel value={selectedTab} index={1}>
        <Attributes selected={selectedBlock} />
      </TabPanel>
      <TabPanel value={selectedTab} index={2}>
        Blocks
      </TabPanel>
    </Box>
  )
}
