import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { ReactElement, ReactNode, SyntheticEvent } from 'react'
import { TreeBlock, useEditor, ActiveTab } from '@core/journeys/ui'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../__generated__/GetJourney'
import { CardPreview } from '../../CardPreview'
import { Attributes } from './Attributes'
import { BlocksTab } from './BlocksTab'
import { AddFab } from './AddFab'

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
      {children}
    </div>
  )
}

function a11yProps(index: number): { id: string; 'aria-controls': string } {
  return {
    id: `journeys-admin-editor-tab-${index}`,
    'aria-controls': `journeys-admin-editor-tabpanel-${index}`
  }
}

export function ControlPanel(): ReactElement {
  const {
    state: { steps, selectedBlock, selectedStep, activeTab },
    dispatch
  } = useEditor()

  const handleChange = (
    _event: SyntheticEvent<Element, Event>,
    newValue: number
  ): void => {
    dispatch({ type: 'SetActiveTabAction', activeTab: newValue })
  }

  const handleSelectStep = (step: TreeBlock<StepBlock>): void => {
    dispatch({ type: 'SetActiveTabAction', activeTab: ActiveTab.Properties })
    dispatch({ type: 'SetSelectedStepAction', step })
  }

  const handleAddFabClick = (): void => {
    dispatch({ type: 'SetActiveTabAction', activeTab: ActiveTab.Blocks })
  }

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      <Box sx={{ position: 'absolute', top: '-64px', right: 20, zIndex: 1 }}>
        <AddFab
          visible={activeTab !== ActiveTab.Blocks}
          onClick={handleAddFabClick}
        />
      </Box>
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: (theme) => theme.palette.background.paper
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleChange}
          aria-label="editor tabs"
        >
          <Tab label="Cards" {...a11yProps(0)} sx={{ flexGrow: 1 }} />
          <Tab
            label="Properties"
            {...a11yProps(1)}
            sx={{ flexGrow: 1 }}
            disabled={selectedBlock == null}
          />
          <Tab label="Blocks" {...a11yProps(2)} sx={{ flexGrow: 1 }} />
        </Tabs>
      </Box>
      <TabPanel value={activeTab} index={0}>
        <CardPreview
          selected={selectedStep}
          onSelect={handleSelectStep}
          steps={steps}
        />
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        {selectedBlock !== undefined && <Attributes selected={selectedBlock} />}
      </TabPanel>
      <TabPanel value={activeTab} index={2}>
        <BlocksTab />
      </TabPanel>
    </Box>
  )
}
