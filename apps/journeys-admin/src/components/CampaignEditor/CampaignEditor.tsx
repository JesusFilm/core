import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useEffect, useState } from 'react'

import { CommandProvider } from '@core/journeys/ui/CommandProvider'

import { GetCampaign_campaign as Campaign } from '../../../__generated__/GetCampaign'
import {
  CampaignPageKind,
  UserTeamRole
} from '../../../__generated__/globalTypes'
import { useCurrentUserLazyQuery } from '../../libs/useCurrentUserLazyQuery'
import { MuxVideoUploadProvider } from '../MuxVideoUploadProvider'

import {
  CampaignEditorProvider,
  useCampaignEditor
} from './CampaignEditorProvider'
import { Canvas } from './Canvas'
import type { CanvasView } from './Canvas'
import { ContextBar } from './ContextBar'
import {
  DOCKED_PANEL_WIDTH,
  EditorPanel,
  EditorPanelsProvider,
  useEditorPanels
} from './EditorPanel'
import { FirstRunHint } from './FirstRunHint'
import { Hotkeys } from './Hotkeys'
import { LanguagesPanel } from './LanguagesPanel'
import { RegionSettings } from './RegionSettings'
import { Settings } from './Settings'
import { ThemePanel } from './ThemePanel'
import { TopBar } from './TopBar'
import { TranslationsView } from './TranslationsView'

/** The editor shell is desktop only: narrower viewports get a message, no canvas. */
export const EDITOR_MIN_WIDTH = 980

interface CampaignEditorProps {
  campaign?: Campaign
}

interface CampaignEditorShellProps {
  campaign: Campaign
  isManager: boolean
}

/** Everything inside the providers: the top bar, the hint, the context bar, the canvas, the docked column and the panels. */
function CampaignEditorShell({
  campaign,
  isManager
}: CampaignEditorShellProps): ReactElement {
  const {
    state: { pageKind, previewLanguageId },
    currentRegion,
    selection,
    dispatch
  } = useCampaignEditor()
  const { mode, setMode, dockOpen, setDockElement } = useEditorPanels()
  const [view, setView] = useState<CanvasView>('desktop')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const [languagesOpen, setLanguagesOpen] = useState(false)
  const [regionSettingsOpen, setRegionSettingsOpen] = useState(false)
  const settingsRegion =
    selection.kind === 'region' ? selection.region : undefined
  const [translationsOpen, setTranslationsOpen] = useState(false)
  const [promotionNoticeShown, setPromotionNoticeShown] = useState(false)

  function handlePageKindChange(
    nextPageKind: CampaignPageKind,
    regionId?: string
  ): void {
    dispatch({ type: 'SetPageKindAction', pageKind: nextPageKind, regionId })
  }

  function handlePreviewLanguageChange(languageId: string): void {
    dispatch({
      type: 'SetPreviewLanguageAction',
      previewLanguageId: languageId
    })
  }

  return (
    <Stack data-testid="CampaignEditor" sx={{ height: '100vh' }}>
      <Hotkeys />
      <TopBar
        campaign={campaign}
        pageKind={pageKind}
        regionId={currentRegion?.id}
        onPageKindChange={handlePageKindChange}
        previewLanguageId={previewLanguageId}
        onPreviewLanguageChange={handlePreviewLanguageChange}
        view={view}
        onViewChange={setView}
        isManager={isManager}
        panelMode={mode}
        onPanelModeChange={setMode}
      />
      <Stack direction="row" sx={{ flexGrow: 1, minHeight: 0 }}>
        <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
          <FirstRunHint campaignId={campaign.id} />
          <ContextBar
            onSettingsClick={() => setSettingsOpen(true)}
            onThemeClick={() => setThemeOpen(true)}
            onLanguagesClick={() => setLanguagesOpen(true)}
            onRegionSettingsClick={() => setRegionSettingsOpen(true)}
            onTranslationsClick={() => setTranslationsOpen(true)}
          />
          <Canvas campaign={campaign} pageKind={pageKind} view={view} />
        </Stack>
        <Box
          ref={setDockElement}
          data-testid="CampaignEditorDock"
          sx={{
            display: dockOpen ? 'block' : 'none',
            width: DOCKED_PANEL_WIDTH,
            flexShrink: 0,
            overflowY: 'auto',
            borderLeft: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}
        />
      </Stack>
      <EditorPanel
        id="settings"
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        closeButton
      >
        <Settings
          campaign={campaign}
          isManager={isManager}
          onDefaultLanguageChanged={() => setPromotionNoticeShown(true)}
        />
      </EditorPanel>
      <EditorPanel
        id="regionSettings"
        open={regionSettingsOpen && settingsRegion != null}
        onClose={() => setRegionSettingsOpen(false)}
        closeButton
      >
        {settingsRegion != null && <RegionSettings region={settingsRegion} />}
      </EditorPanel>
      <EditorPanel
        id="theme"
        open={themeOpen}
        onClose={() => setThemeOpen(false)}
      >
        <ThemePanel onClose={() => setThemeOpen(false)} />
      </EditorPanel>
      <EditorPanel
        id="languages"
        open={languagesOpen}
        onClose={() => setLanguagesOpen(false)}
        closeButton
      >
        <LanguagesPanel campaign={campaign} />
      </EditorPanel>
      <EditorPanel
        id="translations"
        open={translationsOpen}
        onClose={() => {
          setTranslationsOpen(false)
          setPromotionNoticeShown(false)
        }}
        float
        width={640}
        closeButton
      >
        <TranslationsView
          campaign={campaign}
          initialLanguageId={previewLanguageId}
          showPromotionNotice={promotionNoticeShown}
          onPromotionNoticeClose={() => setPromotionNoticeShown(false)}
        />
      </EditorPanel>
    </Stack>
  )
}

/**
 * The full-screen campaign editor: one CommandProvider spanning both pages
 * so the Command history survives switching page, the selection reducer,
 * the Mux upload queue (so a Media Slot upload outlives its panel), the
 * top bar, the first-run hint, the contextual bar floating under it, the
 * canvas and the panels beside or over it. First open after create shows the landing page, nothing selected,
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
          {t('The campaign editor needs a window at least 980 pixels wide.')}
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

  // Matched by email, as TeamManageWrapper does: `me.id` is the users
  // table id while a UserTeam's `user.id` is the Firebase uid, so the two
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
        <MuxVideoUploadProvider>
          <EditorPanelsProvider>
            <CampaignEditorShell campaign={campaign} isManager={isManager} />
          </EditorPanelsProvider>
        </MuxVideoUploadProvider>
      </CampaignEditorProvider>
    </CommandProvider>
  )
}
