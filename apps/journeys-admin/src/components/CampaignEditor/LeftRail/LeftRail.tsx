import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next/pages'
import { MouseEvent, ReactElement, ReactNode, useState } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'
import ArrowLeftIcon from '@core/shared/ui/icons/ArrowLeft'
import ComputerIcon from '@core/shared/ui/icons/Computer'
import Iphone1Icon from '@core/shared/ui/icons/Iphone1'

import { CommandRedoItem } from '../../Editor/Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../Editor/Toolbar/Items/CommandUndoItem'
import { CampaignPanel, useCampaignEditor } from '../CampaignEditorProvider'
import type { CanvasView } from '../Canvas'
import { PublishButton } from '../PublishButton'
import { useTranslationRun } from '../TranslationRunProvider'

import { PANELS } from './panels'

/** The Left Rail's width. */
export const LEFT_RAIL_WIDTH = 56

const CAMPAIGNS_HREF = '/?type=campaigns'

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
 * open, docked beside the rail), and at the bottom undo, redo, the Desktop /
 * Phone view and the Publish button.
 * Undo and redo run the one Command history; the view toggle is never a
 * Command. While a machine-translation run is in flight the back button asks
 * before leaving, since leaving stops the run.
 */
export function LeftRail({ view, onViewChange }: LeftRailProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const { run } = useTranslationRun()
  const [leaveOpen, setLeaveOpen] = useState(false)

  function handleBackClick(event: MouseEvent): void {
    if (run == null) return
    event.preventDefault()
    setLeaveOpen(true)
  }

  function handleLeave(): void {
    setLeaveOpen(false)
    void router.push(CAMPAIGNS_HREF)
  }

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
            href={CAMPAIGNS_HREF}
            onClick={handleBackClick}
            aria-label={t('Back to campaigns')}
          >
            <ArrowLeftIcon />
          </IconButton>
        </Tooltip>
        {PANELS.map(({ panel, label, shortcut, icon }) => (
          <PanelToggle
            key={panel}
            panel={panel}
            label={label(t)}
            shortcut={shortcut}
            icon={icon}
            progress={panel === 'localize' ? run?.progress : undefined}
          />
        ))}
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
      <Dialog
        open={leaveOpen}
        onClose={() => setLeaveOpen(false)}
        dialogTitle={{ title: t('Leave the editor?'), closeButton: true }}
        dialogActionChildren={
          <>
            <Button onClick={() => setLeaveOpen(false)}>{t('Stay')}</Button>
            <Button onClick={handleLeave}>{t('Leave')}</Button>
          </>
        }
        testId="CampaignLeaveDialog"
      >
        <Typography>
          {t('The translation into {{language}} stops.', {
            language: run?.languageName ?? ''
          })}
        </Typography>
      </Dialog>
    </Stack>
  )
}
