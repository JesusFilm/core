import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, ReactNode, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import X2Icon from '@core/shared/ui/icons/X2'

import { FLOATING_PANEL_WIDTH, useEditorPanels } from './EditorPanelsProvider'

/** A floating panel hangs below the top bar and the context bar. */
const FLOATING_PANEL_TOP = 128

interface EditorPanelProps {
  /** Unique among the editor's panels; names the one open panel. */
  id: string
  open: boolean
  onClose: () => void
  /** Always floats, whatever the mode: the wide Translations view. */
  float?: boolean
  /** The floating card's width; the docked column has one width for all. */
  width?: number
  /** Adds a close button for panels without their own. */
  closeButton?: boolean
  children: ReactNode
}

/**
 * One editor panel, shown the way the panel mode says: docked, it portals
 * into the inspector column beside the canvas; floating, it is a card over
 * the canvas's right edge. Never modal. Opening one closes the one before,
 * and Escape closes it; the content mounts only while open.
 */
export function EditorPanel({
  id,
  open,
  onClose,
  float = false,
  width = FLOATING_PANEL_WIDTH,
  closeButton = false,
  children
}: EditorPanelProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  const { mode, dockElement, activate, deactivate } = useEditorPanels()
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const floating = float || mode === 'floating'

  useEffect(() => {
    if (!open) return
    activate(id, !floating, () => onCloseRef.current())
    return () => deactivate(id)
  }, [open, id, floating, activate, deactivate])

  useEffect(() => {
    if (!open) return
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') onCloseRef.current()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  if (!open) return null

  const content = (
    <Box
      data-testid={`EditorPanel-${id}`}
      sx={{ position: 'relative', width: '100%' }}
    >
      {closeButton && (
        <IconButton
          aria-label={t('Close')}
          onClick={onClose}
          size="small"
          sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1 }}
        >
          <X2Icon />
        </IconButton>
      )}
      {children}
    </Box>
  )

  if (!floating) {
    if (dockElement == null) return null
    return createPortal(content, dockElement)
  }

  return (
    <Paper
      elevation={8}
      data-testid={`EditorPanelFloating-${id}`}
      sx={{
        position: 'fixed',
        top: FLOATING_PANEL_TOP,
        right: 16,
        width,
        maxHeight: `calc(100vh - ${FLOATING_PANEL_TOP + 16}px)`,
        maxWidth: 'calc(100vw - 32px)',
        zIndex: 'drawer',
        overflowY: 'auto',
        borderRadius: 2
      }}
    >
      {content}
    </Paper>
  )
}
