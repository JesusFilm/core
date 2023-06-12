import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Tooltip from '@mui/material/Tooltip'
import { ReactElement, SyntheticEvent, useEffect } from 'react'
import {
  useEditor,
  ActiveTab,
  ActiveFab,
  ActiveJourneyEditContent
} from '@core/journeys/ui/EditorProvider'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'
import { TreeBlock } from '@core/journeys/ui/block'
import MuiFab from '@mui/material/Fab'
import EditIcon from '@mui/icons-material/Edit'
import { CardPreview, OnSelectProps } from '../../CardPreview'
import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../__generated__/GetJourney'
import { SocialShareAppearance } from '../Drawer/SocialShareAppearance'
import { Attributes } from './Attributes'
import { BlocksTab } from './BlocksTab'
import { Fab } from './Fab'

export function ControlPanel(): ReactElement {
  const {
    state: {
      steps,
      selectedBlock,
      selectedComponent,
      selectedStep,
      activeTab,
      journeyEditContentComponent
    },
    dispatch
  } = useEditor()

  const selected = selectedComponent ?? selectedBlock ?? 'none'

  useEffect(() => {
    if (
      activeTab === ActiveTab.Journey &&
      journeyEditContentComponent === ActiveJourneyEditContent.SocialPreview
    ) {
      dispatch({
        type: 'SetDrawerPropsAction',
        title: 'Social Share Preview',
        children: <SocialShareAppearance />
      })
    }
  }, [activeTab, dispatch, journeyEditContentComponent])

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
    } else if (view === ActiveJourneyEditContent.SocialPreview) {
      dispatch({
        type: 'SetJourneyEditContentAction',
        component: ActiveJourneyEditContent.SocialPreview
      })
      dispatch({
        type: 'SetDrawerPropsAction',
        title: 'Social Share Preview',
        mobileOpen: false,
        children: <SocialShareAppearance />
      })
    }
  }

  const handleAddFabClick = (): void => {
    dispatch({ type: 'SetActiveTabAction', activeTab: ActiveTab.Blocks })
  }

  const cardBlock = selectedStep?.children.find(
    (block) => block.__typename === 'CardBlock'
  ) as TreeBlock<CardBlock>

  const hasVideoBlock =
    cardBlock?.children?.find(
      (block) =>
        block.__typename === 'VideoBlock' && cardBlock.coverBlockId !== block.id
    ) != null

  const handleSocialEditFabClick = (): void => {
    dispatch({ type: 'SetDrawerMobileOpenAction', mobileOpen: true })
  }

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      <Box sx={{ position: 'absolute', top: '-64px', right: 20, zIndex: 1 }}>
        {journeyEditContentComponent ===
          ActiveJourneyEditContent.SocialPreview && (
          <MuiFab
            color="primary"
            data-testid="social-edit-fab"
            onClick={handleSocialEditFabClick}
            sx={{
              display: { xs: 'inherit', sm: 'none' },
              height: 48,
              width: 48,
              p: 2.5
            }}
          >
            <EditIcon />
          </MuiFab>
        )}
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
              selected == null ||
              journeyEditContentComponent !== ActiveJourneyEditContent.Canvas
            }
          />
          {hasVideoBlock ? (
            <Tooltip
              title="Blocks cannot be placed on top of Video Block"
              arrow
              placement="top"
            >
              <Box sx={{ flexGrow: 1, display: 'flex' }}>
                <Tab label="Blocks" sx={{ flexGrow: 1 }} disabled />
              </Box>
            </Tooltip>
          ) : (
            <Tab
              label="Blocks"
              {...tabA11yProps('control-panel', 2)}
              sx={{ flexGrow: 1 }}
              disabled={
                steps == null ||
                journeyEditContentComponent !==
                  ActiveJourneyEditContent.Canvas ||
                hasVideoBlock
              }
            />
          )}
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
        {selected !== 'none' && selectedStep !== undefined && (
          <Attributes selected={selected} step={selectedStep} />
        )}
      </TabPanel>
      <TabPanel name="control-panel" value={activeTab} index={2}>
        <BlocksTab />
      </TabPanel>
    </Box>
  )
}
