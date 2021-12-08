import { Box, Tabs, Tab } from '@mui/material'
import {
  ReactElement,
  ReactNode,
  SyntheticEvent,
  useContext,
  useState
} from 'react'
import { Attributes } from '../ControlPanel/Attributes'
import { GetJourneyForEdit_journey_blocks_StepBlock as StepBlock } from '../../../../__generated__/GetJourneyForEdit'
import { TreeBlock } from '@core/journeys/ui'
import { CardPreview } from '../../CardPreview'
import { Context } from '../Context'

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
  const [value, setValue] = useState(0)
  const {
    state: { steps, selectedBlock, selectedStep },
    dispatch
  } = useContext(Context)

  const handleChange = (
    _event: SyntheticEvent<Element, Event>,
    newValue: number
  ): void => {
    setValue(newValue)
  }

  const handleSelectStep = (step: TreeBlock<StepBlock>): void => {
    setValue(1)
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
        <Tabs value={value} onChange={handleChange} aria-label="editor tabs">
          <Tab label="Cards" {...a11yProps(0)} sx={{ flexGrow: 1 }} />
          <Tab
            label="Properties"
            {...a11yProps(1)}
            sx={{ flexGrow: 1 }}
            disabled={selectedBlock == null}
          />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <CardPreview
          selected={selectedStep}
          onSelect={handleSelectStep}
          steps={steps}
        />
      </TabPanel>
      <TabPanel value={value} index={1}>
        {selectedBlock != null && <Attributes selected={selectedBlock} />}
      </TabPanel>
    </Box>
  )
}
