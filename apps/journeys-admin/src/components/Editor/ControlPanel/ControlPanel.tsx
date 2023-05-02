import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { ReactElement, SyntheticEvent } from 'react'
import {
  useEditor,
  ActiveTab,
  ActiveFab,
  ActiveJourneyEditContent
} from '@core/journeys/ui/EditorProvider'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'
import { TreeBlock } from '@core/journeys/ui/block'
import { CardPreview, OnSelectProps } from '../../CardPreview'
import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../__generated__/GetJourney'
import { Attributes } from './Attributes'
import { BlocksTab } from './BlocksTab'
import { Fab } from './Fab'

export function ControlPanel(): ReactElement {
  const {
    state: {
      steps,
      selectedBlock,
      selectedStep,
      activeTab,
      journeyEditContentComponent
    },
    dispatch
  } = useEditor()

  const handleChange = (
    _event: SyntheticEvent<Element, Event>,
    newValue: number
  ): void => {
    dispatch({ type: 'SetActiveTabAction', activeTab: newValue })
  }

  const handleSelectStepPreview = ({ step, view }: OnSelectProps): void => {
    if (step != null) {
      dispatch({ type: 'SetSelectedStepAction', step })
      dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Add })
    } else if (view === ActiveJourneyEditContent.Action) {
      dispatch({
        type: 'SetJourneyEditContentAction',
        component: ActiveJourneyEditContent.Action
      })
    }
  }

  const handleAddFabClick = (): void => {
    dispatch({ type: 'SetActiveTabAction', activeTab: ActiveTab.Blocks })
  }

  const cardBlock = selectedStep?.children.find(
    (block) => block.__typename === 'CardBlock'
  ) as TreeBlock<CardBlock>

  console.log(cardBlock)

  const hasVideoBlock =
    cardBlock?.children?.find((block) => block.__typename === 'VideoBlock') !=
      null && cardBlock.coverBlockId == null

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      <Box sx={{ position: 'absolute', top: '-64px', right: 20, zIndex: 1 }}>
        {journeyEditContentComponent === ActiveJourneyEditContent.Canvas &&
          !hasVideoBlock && (
            <Fab
              visible={activeTab !== ActiveTab.Blocks}
              onAddClick={handleAddFabClick}
              disabled={steps == null}
            />
          )}
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
          aria-label="`editor` tabs"
        >
          <Tab
            label="Journey"
            {...tabA11yProps('control-panel', 0)}
            sx={{ flexGrow: 1 }}
          />
          <Tab
            label="Properties"
            {...tabA11yProps('control-panel', 1)}
            sx={{ flexGrow: 1 }}
            disabled={
              steps == null ||
              selectedBlock == null ||
              journeyEditContentComponent !== ActiveJourneyEditContent.Canvas
            }
          />
          <Tab
            label="Blocks"
            {...tabA11yProps('control-panel', 2)}
            sx={{ flexGrow: 1 }}
            disabled={
              steps == null ||
              journeyEditContentComponent !== ActiveJourneyEditContent.Canvas ||
              hasVideoBlock
            }
          />
        </Tabs>
      </Box>
      <TabPanel name="control-panel" value={activeTab} index={0}>
        <CardPreview
          selected={selectedStep}
          onSelect={handleSelectStepPreview}
          steps={steps}
          showAddButton
          showNavigationCards
          isDraggable
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
