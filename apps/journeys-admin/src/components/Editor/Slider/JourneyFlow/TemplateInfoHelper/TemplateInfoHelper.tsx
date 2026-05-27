import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import SouthEastIcon from '@mui/icons-material/SouthEast'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Fade from '@mui/material/Fade'
import Stack from '@mui/material/Stack'
import Unstable_TrapFocus from '@mui/material/Unstable_TrapFocus'
import { useTranslation } from 'next-i18next/pages'
import {
  ReactElement,
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState
} from 'react'

import { TemplateInfoPanel } from '../../../../TemplateInfoPanel'

/**
 * TemplateInfoHelper — the floating ℹ️ entry point that lives in the top-left
 * `Panel` slot of `JourneyFlow` when the journey being edited is a template
 * (NES-1642). Clicking the trigger pill (info icon + a south-east arrow
 * pointing into the panel that's about to expand) reveals a self-contained
 * `TemplateInfoPanel` that visually covers the trigger. The panel carries
 * its own full-width close bar at the bottom with a north-west arrow
 * pointing back to where the trigger sits.
 *
 * Close paths: click the panel's bottom close bar, click outside the
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
  // Stable id for the aria-controls/id pairing. Replaces a module-level
  // constant so two TemplateInfoHelper instances on the same page can't
  // collide on the same DOM id.
  const panelId = useId()
  // Tracks the previous `open` value so the focus-return effect only fires
  // on the closing transition, not on initial mount.
  const wasOpenRef = useRef(false)

  function handleToggle(): void {
    setOpen((prev) => !prev)
  }

  // Per the journeys-admin a11y rule, interactive elements declare an
  // explicit onKeyDown alongside onClick. Native <button> elements (which
  // ButtonBase renders) already activate on Enter/Space via onClick, so
  // we preventDefault here to avoid double-firing handleToggle.
  function handleTriggerKeyDown(
    event: ReactKeyboardEvent<HTMLButtonElement>
  ): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleToggle()
    }
  }

  // Stable handler: identity does not change between renders, which keeps
  // the keydown effect's dependency array honest and prevents a future
  // closure-state edit from silently using a stale reference.
  const handleClose = useCallback((): void => {
    setOpen(false)
  }, [])

  function handleClickAway(): void {
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
  }, [open, handleClose])

  // Return focus to the trigger after the panel finishes closing. Runs in
  // a separate post-commit effect so it doesn't race MUI Unstable_TrapFocus
  // — which performs its own focus restore on `open: false` after Fade's
  // exit transition. The `wasOpenRef` guard ensures we don't steal focus
  // on initial mount (when the user hasn't interacted with the helper yet).
  useEffect(() => {
    if (open) {
      wasOpenRef.current = true
      return
    }
    if (!wasOpenRef.current) return
    triggerRef.current?.focus()
  }, [open])

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ position: 'relative', width: 'fit-content' }}>
        <ButtonBase
          ref={triggerRef}
          data-testid="TemplateInfoHelperTrigger"
          aria-label={t('Open template info')}
          aria-expanded={open}
          // `aria-controls` references the panel by id only while the panel
          // is mounted; `Fade unmountOnExit` removes the panel from the DOM
          // when closed, so referencing it would dangle for screen readers.
          aria-controls={open ? panelId : undefined}
          onClick={handleToggle}
          onKeyDown={handleTriggerKeyDown}
          sx={{
            bgcolor: 'background.paper',
            color: 'text.primary',
            // Match Figma 39661-67393: 16px radius, 1px Editor/Divider stroke,
            // white surface, 20px padding around the 24px icons (NES-1696).
            borderRadius: 4,
            border: 1,
            borderColor: 'divider',
            boxShadow: 2,
            px: 5,
            py: 5,
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
          <Stack direction="row" alignItems="center" spacing={2}>
            <InfoOutlinedIcon
              data-testid="TemplateInfoHelperTriggerInfoIcon"
              sx={{ fontSize: 24 }}
            />
            <SouthEastIcon
              data-testid="TemplateInfoHelperTriggerArrowIcon"
              sx={{ fontSize: 24 }}
            />
          </Stack>
        </ButtonBase>
        <Fade in={open} unmountOnExit>
          <Box
            id={panelId}
            // `inert` (React 19+ native attribute) tab-isolates the panel
            // during Fade's ~225ms exit transition. Unstable_TrapFocus
            // releases focus immediately on `open=false`, but the panel
            // children stay in the DOM until the exit completes — without
            // `inert`, Tab during that window could land focus on an
            // element about to unmount. When `open=true` the attribute is
            // absent and the panel is fully interactive.
            inert={!open}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: (theme) => theme.zIndex.fab
            }}
          >
            <Unstable_TrapFocus open={open}>
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
