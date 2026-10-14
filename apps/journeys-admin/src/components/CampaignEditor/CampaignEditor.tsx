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

import { BottomBar } from './BottomBar'
import {
  CampaignEditorProvider,
  useCampaignEditor
} from './CampaignEditorProvider'
import { Canvas } from './Canvas'
import type { CanvasView } from './Canvas'
import { CanvasBanner } from './CanvasBanner'
import { Hotkeys } from './Hotkeys'
import { Inspector } from './Inspector'
import { LeftPanel } from './LeftPanel'
import { LeftRail } from './LeftRail'
import { LocalizePanel } from './LocalizePanel'
import type { LocalizeTab } from './LocalizePanel'
import { Navigator, NavigatorHoverProvider } from './Navigator'
import { PagesPanel } from './PagesPanel'

/** The editor shell is desktop only: narrower viewports get a message, no canvas. */
export const EDITOR_MIN_WIDTH = 1280

/** From this width a left panel pushes the canvas; below it the panel overlays it. */
export const PANEL_PUSH_MIN_WIDTH = 1440

interface CampaignEditorProps {
  campaign?: Campaign
}

interface CampaignEditorShellProps {
  campaign: Campaign
  isManager: boolean
}

/** Everything inside the providers: the rail, the open panel, the canvas with its banner and bottom bar, and the Inspector. */
function CampaignEditorShell({
  campaign,
  isManager
}: CampaignEditorShellProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { pageKind, panel },
    dispatch
  } = useCampaignEditor()
  const pushesCanvas = useMediaQuery(`(min-width:${PANEL_PUSH_MIN_WIDTH}px)`)
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

  const leftPanel =
    panel === 'pages' ? (
      <LeftPanel label={t('Pages')} overlay={!pushesCanvas}>
        <PagesPanel />
      </LeftPanel>
    ) : panel === 'navigator' ? (
      <LeftPanel label={t('Navigator')} overlay={!pushesCanvas}>
        <Navigator />
      </LeftPanel>
    ) : panel === 'localize' ? (
      <LeftPanel label={t('Localize')} overlay={!pushesCanvas}>
        <LocalizePanel
          tab={localizeTab}
          onTabChange={setLocalizeTab}
          promotionNotice={promotionNotice}
          onPromotionNoticeClose={() => setPromotionNotice(false)}
        />
      </LeftPanel>
    ) : null

  return (
    <Stack
      direction="row"
      data-testid="CampaignEditor"
      sx={{ height: '100vh' }}
    >
      <Hotkeys />
      <LeftRail view={view} onViewChange={setView} isManager={isManager} />
      {pushesCanvas && leftPanel}
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
          {!pushesCanvas && leftPanel}
        </Box>
        <BottomBar />
      </Stack>
      <Inspector
        isManager={isManager}
        onDefaultLanguageChanged={handleDefaultLanguageChanged}
      />
    </Stack>
  )
}

/**
 * The full-screen campaign editor: one CommandProvider spanning both pages
 * so the Command history survives switching page, the selection reducer,
 * the Mux upload queue (so a Media Slot upload outlives the selection), the
 * Left Rail with its panels, the canvas with its banner, the Inspector and the
 * contextual bottom bar. First open after create shows the landing page, nothing selected,
 * Desktop view, the default language as the Preview Language. Nothing
 * replaces Save.
 */
export function CampaignEditor({
  campaign
}: CampaignEditorProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const isDesktop = useMediaQuery(`(min-width:${EDITOR_MIN_WIDTH}px)`)
  const { loadUser, data: currentUser } = useCurrentUserLazyQuery()

  useEffect(() => {
    void loadUser()
  }, [loadUser])

  if (!isDesktop)
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
          {t('The campaign editor needs a window at least 1280 pixels wide.')}
        </Typography>
      </Stack>
    )

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

  const isManager = campaign.team.userTeams.some(
    (userTeam) =>
      userTeam.user.id === currentUser.id &&
      userTeam.role === UserTeamRole.manager
  )

  return (
    <CommandProvider>
      <CampaignEditorProvider campaign={campaign}>
        <MuxVideoUploadProvider>
          <NavigatorHoverProvider>
            <CampaignEditorShell campaign={campaign} isManager={isManager} />
          </NavigatorHoverProvider>
        </MuxVideoUploadProvider>
      </CampaignEditorProvider>
    </CommandProvider>
  )
}
