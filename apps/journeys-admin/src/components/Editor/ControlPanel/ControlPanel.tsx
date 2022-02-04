import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { ReactElement, SyntheticEvent } from 'react'
import { TreeBlock, useEditor, ActiveTab } from '@core/journeys/ui'
import { TabPanel, tabA11yProps } from '@core/shared/ui'
import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../__generated__/GetJourney'
import { CardPreview } from '../../CardPreview'
import { Attributes } from './Attributes'
import { BlocksTab } from './BlocksTab'
import { AddFab } from './AddFab'

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
          <Tab
            label="Cards"
            {...tabA11yProps('control-panel', 0)}
            sx={{ flexGrow: 1 }}
          />
          <Tab
            label="Properties"
            {...tabA11yProps('control-panel', 1)}
            sx={{ flexGrow: 1 }}
            disabled={selectedBlock == null}
          />
          <Tab
            label="Blocks"
            {...tabA11yProps('control-panel', 2)}
            sx={{ flexGrow: 1 }}
          />
        </Tabs>
      </Box>
      <TabPanel name="control-panel" value={activeTab} index={0}>
        <CardPreview
          selected={selectedStep}
          onSelect={handleSelectStep}
          steps={steps}
        />
      </TabPanel>
      <TabPanel name="control-panel" value={activeTab} index={1}>
        {selectedBlock !== undefined && selectedStep !== undefined && (
          <Attributes selected={selectedBlock} step={selectedStep} />
        )}
      </TabPanel>
      <TabPanel name="control-panel" value={activeTab} index={2}>
        <BlocksTab />
      </TabPanel>
    </Box>
  )
}
