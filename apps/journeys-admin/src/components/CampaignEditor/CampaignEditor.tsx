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

import { BottomBar } from './BottomBar'
import {
  CampaignEditorProvider,
  useCampaignEditor
} from './CampaignEditorProvider'
import { Canvas } from './Canvas'
import type { CanvasView } from './Canvas'
import { FirstRunHint } from './FirstRunHint'
import { Hotkeys } from './Hotkeys'
import { Inspector } from './Inspector'
import type { InspectorInlineView } from './Inspector'
import { TopBar } from './TopBar'

/** The editor shell is desktop only: narrower viewports get a message, no canvas. */
export const EDITOR_MIN_WIDTH = 980

interface CampaignEditorProps {
  campaign?: Campaign
}

interface CampaignEditorShellProps {
  campaign: Campaign
  isManager: boolean
}

/** Everything inside the providers: the bars, the hint, the canvas and the Inspector. */
function CampaignEditorShell({
  campaign,
  isManager
}: CampaignEditorShellProps): ReactElement {
  const {
    state: { pageKind, previewLanguageId },
    currentRegion,
    dispatch
  } = useCampaignEditor()
  const [view, setView] = useState<CanvasView>('desktop')
  const [inline, setInline] = useState<InspectorInlineView>()

  function handlePageKindChange(
    nextPageKind: CampaignPageKind,
    regionId?: string
  ): void {
    dispatch({ type: 'SetPageKindAction', pageKind: nextPageKind, regionId })
  }

  /** Languages and Translations open inline in the nothing-selected Settings tab until the Localize panel lands. */
  function handleInlineOpen(next: InspectorInlineView): void {
    dispatch({ type: 'SetInspectorTabAction', inspectorTab: 'settings' })
    setInline(next)
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
      />
      <FirstRunHint campaignId={campaign.id} />
      <Stack direction="row" sx={{ flexGrow: 1, minHeight: 0 }}>
        <Canvas campaign={campaign} pageKind={pageKind} view={view} />
        <Inspector
          isManager={isManager}
          inline={inline}
          onInlineChange={setInline}
        />
      </Stack>
      <BottomBar
        onLanguagesClick={() => handleInlineOpen({ view: 'languages' })}
        onTranslationsClick={() =>
          handleInlineOpen({ view: 'translations', promotionNotice: false })
        }
      />
    </Stack>
  )
}

/**
 * The full-screen campaign editor: one CommandProvider spanning both pages
 * so the Command history survives switching page, the selection reducer,
 * the Mux upload queue (so a Media Slot upload outlives the selection), the
 * top bar, the first-run hint, the canvas, the Inspector and the contextual
 * bottom bar. First open after create shows the landing page, nothing selected,
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

  const isManager = campaign.team.userTeams.some(
    (userTeam) =>
      userTeam.user.id === currentUser.id &&
      userTeam.role === UserTeamRole.manager
  )

  return (
    <CommandProvider>
      <CampaignEditorProvider campaign={campaign}>
        <MuxVideoUploadProvider>
          <CampaignEditorShell campaign={campaign} isManager={isManager} />
        </MuxVideoUploadProvider>
      </CampaignEditorProvider>
    </CommandProvider>
  )
}
