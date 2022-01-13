import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { ReactElement, ReactNode, SyntheticEvent, useContext } from 'react'
import { TreeBlock } from '@core/journeys/ui'
import { GetJourneyForEdit_journey_blocks_StepBlock as StepBlock } from '../../../../__generated__/GetJourneyForEdit'
import { CardPreview } from '../../CardPreview'
import { ActiveTab, EditorContext } from '../Context'
import { Attributes } from './Attributes'

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
  } = useContext(EditorContext)

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

  return (
    <Box sx={{ width: '100%' }}>
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
        {selectedBlock != null && <Attributes selected={selectedBlock} />}
      </TabPanel>
      <TabPanel value={activeTab} index={2}>
        Sample block
      </TabPanel>
    </Box>
  )
}
