import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Tooltip from '@mui/material/Tooltip'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, ReactNode } from 'react'

import ArrowLeftIcon from '@core/shared/ui/icons/ArrowLeft'
import BarGroup3Icon from '@core/shared/ui/icons/BarGroup3'
import ComputerIcon from '@core/shared/ui/icons/Computer'
import File5Icon from '@core/shared/ui/icons/File5'
import Iphone1Icon from '@core/shared/ui/icons/Iphone1'
import Layers4Icon from '@core/shared/ui/icons/Layers4'
import Plus2Icon from '@core/shared/ui/icons/Plus2'
import TranslateIcon from '@core/shared/ui/icons/Translate'

import { CommandRedoItem } from '../../Editor/Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../Editor/Toolbar/Items/CommandUndoItem'
import { CampaignPanel, useCampaignEditor } from '../CampaignEditorProvider'
import type { CanvasView } from '../Canvas'
import { PublishButton } from '../PublishButton'
import { useTranslationRun } from '../TranslationRunProvider'

/** The Left Rail's width. */
export const LEFT_RAIL_WIDTH = 56

interface LeftRailProps {
  view: CanvasView
  onViewChange: (view: CanvasView) => void
}

interface PanelToggleProps {
  panel: CampaignPanel
  label: string
  shortcut?: string
  icon: ReactNode
  /** A background operation's progress (0-100), ringed round the icon while it runs. */
  progress?: number
}

function PanelToggle({
  panel,
  label,
  shortcut,
  icon,
  progress
}: PanelToggleProps): ReactElement {
  const {
    state: { panel: openPanel },
    dispatch
  } = useCampaignEditor()
  const open = openPanel === panel
  const running = progress != null
  const tooltip = shortcut == null ? label : `${label} (${shortcut})`

  return (
    <Tooltip
      title={running ? `${label}: ${Math.round(progress)}%` : tooltip}
      placement="right"
      arrow
    >
      <IconButton
        aria-label={label}
        aria-pressed={open}
        aria-busy={running}
        onClick={() => dispatch({ type: 'SetPanelAction', panel })}
        sx={{
          color: open ? 'primary.main' : 'text.secondary',
          bgcolor: open ? 'action.selected' : undefined
        }}
      >
        {icon}
        {running && (
          <Box
            aria-hidden
            data-testid={`${panel}Progress`}
            sx={{ position: 'absolute', inset: 0, display: 'flex' }}
          >
            <CircularProgress
              variant="determinate"
              value={progress}
              size={40}
              thickness={3}
            />
          </Box>
        )}
      </IconButton>
    </Tooltip>
  )
}

/**
 * The editor's left column of icon buttons: the back button to the campaigns
 * list, the Add, Pages, Navigator and Localize panel toggles (one panel always
 * open, docked beside the rail), the link to the Campaign Report, and at the
 * bottom undo, redo, the Desktop / Phone view and the Publish button.
 * Undo and redo run the one Command history; the view toggle is never a
 * Command.
 */
export function LeftRail({ view, onViewChange }: LeftRailProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { run } = useTranslationRun()
  const { campaign } = useCampaignEditor()

  function handleViewChange(
    _event: unknown,
    nextView: CanvasView | null
  ): void {
    if (nextView != null) onViewChange(nextView)
  }

  return (
    <Stack
      component={Paper}
      elevation={0}
      square
      data-testid="CampaignLeftRail"
      aria-label={t('Campaign tools')}
      sx={{
        width: LEFT_RAIL_WIDTH,
        flexShrink: 0,
        py: 2,
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRight: 1,
        borderColor: 'divider'
      }}
    >
      <Stack spacing={1} sx={{ alignItems: 'center' }}>
        <Tooltip title={t('Back to campaigns')} placement="right" arrow>
          <IconButton
            component={NextLink}
            href="/?type=campaigns"
            aria-label={t('Back to campaigns')}
          >
            <ArrowLeftIcon />
          </IconButton>
        </Tooltip>
        <PanelToggle
          panel="add"
          label={t('Add')}
          shortcut="A"
          icon={<Plus2Icon />}
        />
        <PanelToggle
          panel="pages"
          label={t('Pages')}
          shortcut="P"
          icon={<File5Icon />}
        />
        <PanelToggle
          panel="navigator"
          label={t('Navigator')}
          shortcut="Z"
          icon={<Layers4Icon />}
        />
        <PanelToggle
          panel="localize"
          label={t('Localize')}
          icon={<TranslateIcon />}
          progress={run?.progress}
        />
        <Tooltip title={t('Report')} placement="right" arrow>
          <IconButton
            component={NextLink}
            href={`/campaigns/${campaign.id}/reports`}
            aria-label={t('Report')}
          >
            <BarGroup3Icon />
          </IconButton>
        </Tooltip>
      </Stack>
      <Stack spacing={1} sx={{ alignItems: 'center' }}>
        <CommandUndoItem variant="icon-button" />
        <CommandRedoItem variant="icon-button" />
        <ToggleButtonGroup
          exclusive
          orientation="vertical"
          size="small"
          value={view}
          onChange={handleViewChange}
          aria-label={t('Preview size')}
        >
          <ToggleButton value="desktop" aria-label={t('Desktop')}>
            <ComputerIcon />
          </ToggleButton>
          <ToggleButton value="phone" aria-label={t('Phone')}>
            <Iphone1Icon />
          </ToggleButton>
        </ToggleButtonGroup>
        <PublishButton />
      </Stack>
    </Stack>
  )
}
