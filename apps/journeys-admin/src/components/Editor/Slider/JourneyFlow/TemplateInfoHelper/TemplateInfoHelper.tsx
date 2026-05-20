import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Fade from '@mui/material/Fade'
import Stack from '@mui/material/Stack'
import Unstable_TrapFocus from '@mui/material/Unstable_TrapFocus'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useEffect, useRef, useState } from 'react'

import { TemplateInfoPanel } from '../../../../TemplateInfoPanel'

const PANEL_ID = 'TemplateInfoHelperPanel'

/**
 * TemplateInfoHelper — the floating ℹ️ entry point that lives in the top-left
 * `Panel` slot of `JourneyFlow` when the journey being edited is a template
 * (NES-1642). Clicking the trigger pill (Figma frame `39631-61135` — an info
 * icon plus an arrow-up-right icon in a rectangular surface) reveals a
 * self-contained `TemplateInfoPanel` that visually covers the trigger. The
 * panel carries its own arrow-up-right close affordance at the bottom that
 * pairs with the trigger to dismiss the disclosure.
 *
 * Close paths: click the panel's bottom close button, click outside the
 * floating wrapper, or press Escape. Focus moves into the panel on open
 * (trapped while open) and returns to the trigger button on close.
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
      <Box sx={{ position: 'relative', width: 'fit-content' }}>
        <ButtonBase
          ref={triggerRef}
          data-testid="TemplateInfoHelperTrigger"
          aria-label={t('Open template info')}
          aria-expanded={open}
          aria-controls={PANEL_ID}
          onClick={handleToggle}
          sx={{
            bgcolor: 'background.paper',
            color: 'text.primary',
            borderRadius: 1.5,
            boxShadow: 2,
            px: 1.5,
            py: 1,
            '&:hover': {
              bgcolor: 'background.paper',
              boxShadow: 3
            },
            '&:focus-visible': {
              outline: (theme) => `2px solid ${theme.palette.primary.main}`,
              outlineOffset: 2
            }
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <InfoOutlinedIcon data-testid="TemplateInfoHelperTriggerInfoIcon" />
            <ArrowOutwardIcon data-testid="TemplateInfoHelperTriggerArrowIcon" />
          </Stack>
        </ButtonBase>
        <Fade in={open} unmountOnExit>
          <Box
            id={PANEL_ID}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: (theme) => theme.zIndex.fab
            }}
          >
            <Unstable_TrapFocus open={open} disableAutoFocus={false}>
              <Box tabIndex={-1}>
                <TemplateInfoPanel contained onClose={handleClose} />
              </Box>
            </Unstable_TrapFocus>
          </Box>
        </Fade>
      </Box>
    </ClickAwayListener>
  )
}
