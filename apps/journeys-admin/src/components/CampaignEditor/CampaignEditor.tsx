import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useEffect, useState } from 'react'

import { CommandProvider } from '@core/journeys/ui/CommandProvider'

import { GetCampaign_campaign as Campaign } from '../../../__generated__/GetCampaign'
import { UserTeamRole } from '../../../__generated__/globalTypes'
import { useCurrentUserLazyQuery } from '../../libs/useCurrentUserLazyQuery'
import { MuxVideoUploadProvider } from '../MuxVideoUploadProvider'

import { AddPanel } from './AddPanel'
import {
  CampaignEditorProvider,
  CampaignPanel,
  useCampaignEditor
} from './CampaignEditorProvider'
import { CANVAS_GUTTER, Canvas, MIN_STAGE_WIDTH } from './Canvas'
import type { CanvasView } from './Canvas'
import { CanvasBanner } from './CanvasBanner'
import { Hotkeys } from './Hotkeys'
import { INSPECTOR_WIDTH, Inspector } from './Inspector'
import { LEFT_PANEL_WIDTH, LeftPanel } from './LeftPanel'
import { LEFT_RAIL_WIDTH, LeftRail, PANELS } from './LeftRail'
import { LocalizePanel } from './LocalizePanel'
import type { LocalizeTab } from './LocalizePanel'
import { Navigator, NavigatorHoverProvider } from './Navigator'
import { PagesPanel } from './PagesPanel'
import {
  TranslationRunProvider,
  useTranslationRun
} from './TranslationRunProvider'
import { CampaignCommandProvider } from './utils/useCampaignCommand'
import { useCampaignLeaveGuard } from './utils/useCampaignLeaveGuard'

/**
 * The editor shell is desktop only: narrower viewports get a message, no
 * canvas. The minimum is the row at its narrowest: the Left Rail (56 px), the
 * docked left panel (300 px), the Inspector (328 px) and the canvas gutters
 * (2 × 32 px), plus the 600 px stage the Desktop frame needs at its 0.5 floor
 * scale, so the frame never paints under the panel or the Inspector. 1348 px.
 */
export const EDITOR_MIN_WIDTH =
  LEFT_RAIL_WIDTH +
  LEFT_PANEL_WIDTH +
  INSPECTOR_WIDTH +
  2 * CANVAS_GUTTER +
  MIN_STAGE_WIDTH

interface CampaignEditorProps {
  campaign?: Campaign
}

interface CampaignEditorShellProps {
  campaign: Campaign
  isManager: boolean
}

/** Everything inside the providers: the rail, the docked panel (always one open, ahead of the canvas in Tab order), the canvas with its banner, and the Inspector. */
function CampaignEditorShell({
  campaign,
  isManager
}: CampaignEditorShellProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { pageKind, panel },
    dispatch
  } = useCampaignEditor()
  const [view, setView] = useState<CanvasView>('desktop')
  const [localizeTab, setLocalizeTab] = useState<LocalizeTab>('languages')
  const [promotionNotice, setPromotionNotice] = useState(false)

  /** A default-language swap opens Localize on Translations with the promotion notice. */
  function handleDefaultLanguageChanged(): void {
    setLocalizeTab('translations')
    setPromotionNotice(true)
    if (panel !== 'localize')
      dispatch({ type: 'SetPanelAction', panel: 'localize' })
  }

  function handlePromotionNoticeClose(): void {
    setPromotionNotice(false)
  }

  const panelBodies: Record<CampaignPanel, ReactElement> = {
    add: <AddPanel />,
    pages: <PagesPanel />,
    navigator: <Navigator />,
    localize: (
      <LocalizePanel
        tab={localizeTab}
        onTabChange={setLocalizeTab}
        promotionNotice={promotionNotice}
        onPromotionNoticeClose={handlePromotionNoticeClose}
      />
    )
  }
  const openPanel = PANELS.find((entry) => entry.panel === panel)
  const leftPanel = (
    <LeftPanel label={openPanel?.label(t) ?? ''}>{panelBodies[panel]}</LeftPanel>
  )

  return (
    <Stack
      direction="row"
      data-testid="CampaignEditor"
      sx={{ height: '100vh' }}
    >
      <Hotkeys />
      <LeftRail view={view} onViewChange={setView} />
      {leftPanel}
      <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
        <Box
          sx={{
            position: 'relative',
            flexGrow: 1,
            minHeight: 0,
            display: 'flex'
          }}
        >
          <CanvasBanner />
          <Canvas campaign={campaign} pageKind={pageKind} view={view} />
        </Box>
      </Stack>
      <Inspector
        isManager={isManager}
        onDefaultLanguageChanged={handleDefaultLanguageChanged}
      />
    </Stack>
  )
}

/** Narrower than {@link EDITOR_MIN_WIDTH}: a message in place of the shell. */
function CampaignEditorLargerScreen(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Stack
      data-testid="CampaignEditorLargerScreen"
      sx={{
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 6
      }}
    >
      <Typography variant="h5" gutterBottom>
        {t('Open this on a larger screen')}
      </Typography>
      <Typography color="text.secondary">
        {t(
          'The campaign editor needs a window at least {{width}} pixels wide.',
          { width: EDITOR_MIN_WIDTH }
        )}
      </Typography>
    </Stack>
  )
}

/**
 * Inside the providers, so crossing the minimum width swaps only the shell
 * for the larger-screen message: the Command history and a run in flight
 * survive it. Leaving the page while a run is in flight asks first.
 */
function CampaignEditorViewport({
  campaign,
  isManager
}: CampaignEditorShellProps): ReactElement {
  const isDesktop = useMediaQuery(`(min-width:${EDITOR_MIN_WIDTH}px)`)
  const { run } = useTranslationRun()
  useCampaignLeaveGuard([run != null])

  if (!isDesktop) return <CampaignEditorLargerScreen />
  return <CampaignEditorShell campaign={campaign} isManager={isManager} />
}

/**
 * The full-screen campaign editor: one CommandProvider spanning both pages
 * so the Command history survives switching page, the selection reducer,
 * the Campaign Command module with its one queue of Command steps, the Mux
 * upload queue (so a Media Slot upload outlives the selection), the
 * machine-translation run (so it outlives the Localize panel), the
 * Left Rail with its panels, the canvas with its banner and the Inspector.
 * The providers stay mounted below the minimum width, which swaps only the
 * shell for a message. First open after create shows the landing page,
 * nothing selected, Desktop view, the default language as the Preview
 * Language. Nothing replaces Save.
 */
export function CampaignEditor({
  campaign
}: CampaignEditorProps): ReactElement {
  const { loadUser, data: currentUser } = useCurrentUserLazyQuery()

  useEffect(() => {
    void loadUser()
  }, [loadUser])

  if (campaign == null)
    return (
      <Box
        data-testid="CampaignEditorLoading"
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircularProgress />
      </Box>
    )

  // Matched by email, as CustomDomainDialog does: `me.id` is the users
  // table uuid while a UserTeam's `user.id` is the Firebase uid, so the two
  // never compare equal.
  const isManager =
    currentUser.__typename === 'AuthenticatedUser' &&
    campaign.team.userTeams.some(
      (userTeam) =>
        userTeam.user.__typename === 'AuthenticatedUser' &&
        userTeam.user.email === currentUser.email &&
        userTeam.role === UserTeamRole.manager
    )

  return (
    <CommandProvider>
      <CampaignEditorProvider campaign={campaign}>
        <CampaignCommandProvider>
          <MuxVideoUploadProvider>
            <TranslationRunProvider>
              <NavigatorHoverProvider>
                <CampaignEditorViewport
                  campaign={campaign}
                  isManager={isManager}
                />
              </NavigatorHoverProvider>
            </TranslationRunProvider>
          </MuxVideoUploadProvider>
        </CampaignCommandProvider>
      </CampaignEditorProvider>
    </CommandProvider>
  )
}
