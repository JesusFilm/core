import Box from '@mui/material/Box'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Fade from '@mui/material/Fade'
import IconButton from '@mui/material/IconButton'
import Unstable_TrapFocus from '@mui/material/Unstable_TrapFocus'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useEffect, useRef, useState } from 'react'

import InformationCircleContainedIcon from '@core/shared/ui/icons/InformationCircleContained'

import { TemplateInfoPanel } from '../../../../TemplateInfoPanel'

const PANEL_ID = 'TemplateInfoHelperPanel'

/**
 * TemplateInfoHelper — the floating ℹ️ entry point that lives in the top-left
 * `Panel` slot of `JourneyFlow` when the journey being edited is a template
 * (NES-1642). Clicking the trigger reveals a self-contained `TemplateInfoPanel`
 * floating against the canvas; closing returns focus to the trigger.
 *
 * Close paths: re-click trigger, click outside the floating wrapper, press
 * Escape. Focus moves into the panel on open (trapped while open) and returns
 * to the trigger button on close.
 *
 * Animation mirrors the sibling `JourneyAnalyticsCard` slot (`Fade`) so the
 * two top-left affordances feel motion-symmetric.
 */
export function TemplateInfoHelper(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  function handleToggle(): void {
    setOpen((prev) => !prev)
  }

  function handleClose(): void {
    setOpen(false)
    triggerRef.current?.focus()
  }

  function handleClickAway(): void {
    if (!open) return
    handleClose()
  }

  useEffect(() => {
    if (!open) return
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        handleClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ position: 'relative' }}>
        <IconButton
          ref={triggerRef}
          data-testid="TemplateInfoHelperTrigger"
          aria-label={
            open ? t('Close template info') : t('Open template info')
          }
          aria-expanded={open}
          aria-controls={PANEL_ID}
          onClick={handleToggle}
          sx={{
            bgcolor: 'background.paper',
            color: 'text.primary',
            boxShadow: 2,
            '&:hover': {
              bgcolor: 'background.paper'
            }
          }}
        >
          <InformationCircleContainedIcon />
        </IconButton>
        <Fade in={open} unmountOnExit>
          <Box
            id={PANEL_ID}
            sx={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              zIndex: (theme) => theme.zIndex.fab
            }}
          >
            <Unstable_TrapFocus open={open} disableAutoFocus={false}>
              <Box tabIndex={-1}>
                <TemplateInfoPanel contained />
              </Box>
            </Unstable_TrapFocus>
          </Box>
        </Fade>
      </Box>
    </ClickAwayListener>
  )
}
