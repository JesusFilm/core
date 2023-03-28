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
import MuiFab from '@mui/material/Fab'
import EditIcon from '@mui/icons-material/Edit'
import { CardPreview, OnSelectProps } from '../../CardPreview'
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
    } else if (view != null) {
      dispatch({
        type: 'SetJourneyEditContentAction',
        component: ActiveJourneyEditContent.SocialPreview
      })
    }
  }

  const handleAddFabClick = (): void => {
    dispatch({ type: 'SetActiveTabAction', activeTab: ActiveTab.Blocks })
  }

  const handleSocialEditFabClick = (): void => {
    dispatch({ type: 'SetDrawerMobileOpenAction', mobileOpen: true })
  }

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      <Box sx={{ position: 'absolute', top: '-64px', right: 20, zIndex: 1 }}>
        {journeyEditContentComponent ===
        ActiveJourneyEditContent.SocialPreview ? (
          <MuiFab
            color="primary"
            data-testid="social-edit-fab"
            onClick={handleSocialEditFabClick}
            sx={{ display: { xs: 'inherit', sm: 'none' } }}
          >
            <EditIcon />
          </MuiFab>
        ) : (
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
            label="Cards"
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
              journeyEditContentComponent !== ActiveJourneyEditContent.Canvas
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
