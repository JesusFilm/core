import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { blockLabel } from '../blockLabel'
import { Breadcrumb } from '../Breadcrumb'
import {
  CampaignInspectorTab,
  useCampaignEditor
} from '../CampaignEditorProvider'

import { blockIcon } from './blockIcon'
import { InspectorActions } from './InspectorActions'
import { InspectorSettings } from './InspectorSettings'
import { InspectorStyle } from './InspectorStyle'

/** The Inspector's width: the journey editor's drawer width. */
export const INSPECTOR_WIDTH = 328

/** The padding, in theme spacing units, between the Inspector's edge and its header and body. */
export const INSPECTOR_PADDING = 4

interface InspectorProps {
  isManager: boolean
  /** The default language was swapped; the shell opens Localize on Translations. */
  onDefaultLanguageChanged?: () => void
}

/**
 * The persistent right panel for the selection. Its header carries the
 * element-type icon and the block's label, the breadcrumb and the actions
 * row (move, duplicate, delete); an Extra's header also says which section it
 * inherits from, with a link that selects it. Below the header it holds a Style and a Settings tab, switched
 * on the selection kind. With nothing selected it holds the campaign's Theme
 * and settings. It never dims or blocks the canvas, and selecting another
 * block simply swaps its content.
 */
export function Inspector({
  isManager,
  onDefaultLanguageChanged
}: InspectorProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    campaign,
    selection,
    state: { inspectorTab },
    dispatch,
    selectBlock
  } = useCampaignEditor()

  const label =
    selection.kind === 'region' && selection.region != null
      ? selection.region.name
      : selection.block != null
        ? blockLabel(t, selection.block.__typename)
        : t('Campaign')
  const inheritsFrom =
    (selection.kind === 'text' || selection.kind === 'button') &&
    selection.host != null
      ? selection.host
      : undefined
  const bodyKey = selection.block?.id ?? selection.region?.id ?? 'campaign'

  function handleTabChange(_event: unknown, next: CampaignInspectorTab): void {
    dispatch({ type: 'SetInspectorTabAction', inspectorTab: next })
  }

  return (
    <Stack
      component={Paper}
      elevation={0}
      square
      data-testid="CampaignInspector"
      data-selection={selection.kind}
      aria-label={t('Inspector')}
      sx={{
        width: INSPECTOR_WIDTH,
        flexShrink: 0,
        minHeight: 0,
        borderLeft: 1,
        borderColor: 'divider'
      }}
    >
      <Stack spacing={2} sx={{ p: INSPECTOR_PADDING }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          {blockIcon(
            selection.kind === 'region'
              ? 'CampaignRegionSwitcherBlock'
              : selection.block?.__typename
          )}
          <Typography
            variant="subtitle1"
            noWrap
            data-testid="CampaignInspectorLabel"
          >
            {label}
          </Typography>
        </Stack>
        {inheritsFrom != null && (
          <Link
            component="button"
            type="button"
            variant="body2"
            underline="hover"
            data-testid="InspectorInheritsFrom"
            onClick={() => selectBlock(inheritsFrom.id)}
            sx={{ alignSelf: 'flex-start' }}
          >
            {t('Inherits from {{host}}', {
              host: blockLabel(t, inheritsFrom.__typename)
            })}
          </Link>
        )}
        <Breadcrumb />
        <InspectorActions />
      </Stack>
      <Tabs
        value={inspectorTab}
        onChange={handleTabChange}
        variant="fullWidth"
        aria-label={t('Inspector')}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab
          value="style"
          label={t('Style')}
          id="inspector-tab-style"
          aria-controls="inspector-panel"
        />
        <Tab
          value="settings"
          label={t('Settings')}
          id="inspector-tab-settings"
          aria-controls="inspector-panel"
        />
      </Tabs>
      <Box
        role="tabpanel"
        id="inspector-panel"
        aria-labelledby={`inspector-tab-${inspectorTab}`}
        data-testid={`CampaignInspector${inspectorTab === 'style' ? 'Style' : 'Settings'}`}
        sx={{
          flexGrow: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          p: INSPECTOR_PADDING
        }}
      >
        {inspectorTab === 'style' ? (
          <InspectorStyle key={bodyKey} />
        ) : (
          <InspectorSettings
            key={bodyKey}
            campaign={campaign}
            isManager={isManager}
            onDefaultLanguageChanged={onDefaultLanguageChanged}
          />
        )}
      </Box>
    </Stack>
  )
}
