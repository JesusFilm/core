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
import ComputerIcon from '@core/shared/ui/icons/Computer'
import File5Icon from '@core/shared/ui/icons/File5'
import Globe1Icon from '@core/shared/ui/icons/Globe1'
import Iphone1Icon from '@core/shared/ui/icons/Iphone1'

import { CommandRedoItem } from '../../Editor/Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../Editor/Toolbar/Items/CommandUndoItem'
import { CampaignPanel, useCampaignEditor } from '../CampaignEditorProvider'
import type { CanvasView } from '../Canvas'
import { PublishButton } from '../PublishButton'

/** The Left Rail's width. */
export const LEFT_RAIL_WIDTH = 56

interface LeftRailProps {
  view: CanvasView
  onViewChange: (view: CanvasView) => void
  /** Publish and Unpublish are campaign Manage: a manager of the team only. */
  isManager: boolean
}

interface PanelToggleProps {
  panel: Exclude<CampaignPanel, 'none'>
  label: string
  shortcut?: string
  icon: ReactNode
}

function PanelToggle({
  panel,
  label,
  shortcut,
  icon
}: PanelToggleProps): ReactElement {
  const {
    state: { panel: openPanel },
    dispatch
  } = useCampaignEditor()
  const open = openPanel === panel

  return (
    <Tooltip
      title={shortcut == null ? label : `${label} (${shortcut})`}
      placement="right"
      arrow
    >
      <IconButton
        aria-label={label}
        aria-pressed={open}
        onClick={() => dispatch({ type: 'SetPanelAction', panel })}
        sx={{
          color: open ? 'primary.main' : 'text.secondary',
          bgcolor: open ? 'action.selected' : undefined
        }}
      >
        {icon}
      </IconButton>
    </Tooltip>
  )
}

/**
 * The editor's left column of icon buttons: the back button to the campaigns
 * list, the Pages and Localize panel toggles (one panel open at a time), and
 * at the bottom undo, redo, the Desktop / Phone view and the Publish button.
 * Undo and redo run the one Command history; the view toggle is never a
 * Command.
 */
export function LeftRail({
  view,
  onViewChange,
  isManager
}: LeftRailProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

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
            href="/campaigns"
            aria-label={t('Back to campaigns')}
          >
            <ArrowLeftIcon />
          </IconButton>
        </Tooltip>
        <PanelToggle
          panel="pages"
          label={t('Pages')}
          shortcut="P"
          icon={<File5Icon />}
        />
        <PanelToggle
          panel="localize"
          label={t('Localize')}
          icon={<Globe1Icon />}
        />
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
        <PublishButton isManager={isManager} />
      </Stack>
    </Stack>
  )
}
