import Box from '@mui/material/Box'
import MuiFab from '@mui/material/Fab'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Tooltip from '@mui/material/Tooltip'
import dynamic from 'next/dynamic'
import { ReactElement, SyntheticEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveFab,
  ActiveJourneyEditContent,
  ActiveTab,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'

import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../__generated__/GetJourney'
import { CardPreview, OnSelectProps } from '../../CardPreview'
import { ActionDetails } from '../ActionDetails'
import { SocialShareAppearance } from '../Drawer/SocialShareAppearance'
import { Properties } from '../Properties'

import { Fab } from './Fab'

const Attributes = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ControlPanel/Attributes" */
      './Attributes'
    ).then((mod) => mod.Attributes),
  { ssr: false }
)
const BlocksTab = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ControlPanel/BlocksTab" */
      './BlocksTab'
    ).then((mod) => mod.BlocksTab),
  { ssr: false }
)
const CardTemplateDrawer = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/CardTemplateDrawer" */
      '../CardTemplateDrawer'
    ).then((module) => module.CardTemplateDrawer),
  { ssr: false }
)

export function ControlPanel(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
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

  const handleChange = (
    _event: SyntheticEvent<Element, Event>,
    newValue: number
  ): void => {
    dispatch({ type: 'SetActiveTabAction', activeTab: newValue })

    if (newValue === ActiveTab.Journey) {
      switch (journeyEditContentComponent) {
        case ActiveJourneyEditContent.SocialPreview:
          dispatch({
            type: 'SetDrawerPropsAction',
            title: t('Social Share Preview'),
            children: <SocialShareAppearance />
          })
          break
        case ActiveJourneyEditContent.Action:
          dispatch({
            type: 'SetDrawerPropsAction',
            mobileOpen: true,
            title: t('Information'),
            children: <ActionDetails />
          })
          break
        default:
          if (selectedStep?.children[0].children.length === 0) {
            dispatch({
              type: 'SetSelectedAttributeIdAction',
              id: undefined
            })
            dispatch({
              type: 'SetDrawerPropsAction',
              mobileOpen: false,
              title: t('Card Templates'),
              children: <CardTemplateDrawer />
            })
          } else {
            dispatch({
              type: 'SetDrawerPropsAction',
              mobileOpen: false,
              title: t('Properties'),
              children: <Properties isPublisher={false} />
            })
          }
          break
      }
    }
  }

  const handleSelectStepPreview = ({ step, view }: OnSelectProps): void => {
    if (step != null) {
      // this is mirrored in the editor canvas handleSlideChange fn
      dispatch({ type: 'SetSelectedStepAction', step })
      dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Add })
      if (step.children[0].children.length === 0) {
        dispatch({
          type: 'SetSelectedAttributeIdAction',
          id: undefined
        })
        dispatch({
          type: 'SetDrawerPropsAction',
          mobileOpen: false,
          title: t('Card Templates'),
          children: <CardTemplateDrawer />
        })
      } else {
        dispatch({
          type: 'SetDrawerPropsAction',
          mobileOpen: false,
          title: t('Properties'),
          children: <Properties isPublisher={false} />
        })
      }
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
        title: t('Social Share Preview'),
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
    <Stack sx={{ height: '100%' }} data-testid="EditorControlPanel">
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
            <Edit2Icon />
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
      <Stack
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: 'background.paper'
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleChange}
          aria-label="`editor` tabs"
        >
          <Tab
            label={t('Journey')}
            {...tabA11yProps('control-panel', 0)}
            sx={{ flexGrow: 1 }}
          />
          <Tab
            label={t('Properties')}
            {...tabA11yProps('control-panel', 1)}
            sx={{ flexGrow: 1 }}
            disabled={
              steps == null ||
              selected === 'none' ||
              journeyEditContentComponent !== ActiveJourneyEditContent.Canvas
            }
          />
          {hasVideoBlock ? (
            <Tooltip
              title={t('Blocks cannot be placed on top of Video Block')}
              arrow
              placement="top"
            >
              <Box sx={{ flexGrow: 1, display: 'flex' }}>
                <Tab label={t('Blocks')} sx={{ flexGrow: 1 }} disabled />
              </Box>
            </Tooltip>
          ) : (
            <Tab
              label={t('Blocks')}
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
      </Stack>
      <Stack
        justifyContent="center"
        sx={{ backgroundColor: 'background.default', height: '100%' }}
      >
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
        <TabPanel
          name="control-panel"
          value={activeTab}
          index={1}
          unmountUntilVisible
        >
          {selected !== 'none' && selectedStep !== undefined && (
            <Attributes selected={selected} step={selectedStep} />
          )}
        </TabPanel>
        <TabPanel
          name="control-panel"
          value={activeTab}
          index={2}
          unmountUntilVisible
        >
          <BlocksTab />
        </TabPanel>
      </Stack>
    </Stack>
  )
}
