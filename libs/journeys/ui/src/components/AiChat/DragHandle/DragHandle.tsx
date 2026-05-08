import Box from '@mui/material/Box'
import { useTranslation } from 'next-i18next/pages'
import {
  ReactElement,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  TouchEvent as ReactTouchEvent,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'

import { DIVIDER, TEXT_SECONDARY } from '../chatStyles'

const DRAG_THRESHOLD_PX = 32
const TAP_MAX_MOVE_PX = 4

export interface DragSheetHandlers {
  onDragStart?: () => void
  onDrag?: (deltaY: number) => void
  onDragEnd?: (deltaY: number) => void
  /** Fires when the gesture didn't move past the tap threshold. */
  onTap?: () => void
}

interface DragSheetBindings {
  onMouseDown: (event: ReactMouseEvent<HTMLElement>) => void
  onTouchStart: (event: ReactTouchEvent<HTMLElement>) => void
}

/**
 * Shared mouse/touch drag binding for the chat sheet. Tracks the
 * **max absolute displacement** during the gesture (not just the final
 * delta) so a drag-then-return gesture is still recognised as a drag —
 * preventing the drag-then-tap edge case where releasing near the start
 * point fires a synthetic click and toggles the sheet.
 *
 * Touchmove is registered as non-passive so we can call preventDefault to
 * stop the underlying surface (conversation, page) from scrolling while
 * the user is dragging.
 */
export function useDragSheet(handlers: DragSheetHandlers = {}): {
  dragging: boolean
  bind: DragSheetBindings
} {
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  const [dragging, setDragging] = useState(false)
  const startYRef = useRef<number | null>(null)
  const movedRef = useRef(0)
  const maxAbsMovedRef = useRef(0)
  const draggingRef = useRef(false)

  useEffect(() => {
    if (!dragging) return undefined
    const handleMove = (clientY: number, isTouch: boolean): boolean => {
      if (startYRef.current == null) return false
      const delta = clientY - startYRef.current
      movedRef.current = delta
      if (Math.abs(delta) > maxAbsMovedRef.current) {
        maxAbsMovedRef.current = Math.abs(delta)
      }
      handlersRef.current.onDrag?.(delta)
      // Suppress page/conversation scroll under the gesture once the user
      // has moved past the tap threshold.
      return isTouch && maxAbsMovedRef.current > TAP_MAX_MOVE_PX
    }
    const handleMouseMove = (e: MouseEvent): void => {
      handleMove(e.clientY, false)
    }
    const handleTouchMove = (e: TouchEvent): void => {
      if (e.touches.length === 0) return
      const shouldPrevent = handleMove(e.touches[0].clientY, true)
      if (shouldPrevent) e.preventDefault()
    }
    const handleUp = (): void => {
      if (!draggingRef.current) return
      const moved = movedRef.current
      const maxAbsMoved = maxAbsMovedRef.current
      draggingRef.current = false
      setDragging(false)
      startYRef.current = null
      movedRef.current = 0
      maxAbsMovedRef.current = 0
      handlersRef.current.onDragEnd?.(moved)
      if (maxAbsMoved <= TAP_MAX_MOVE_PX) {
        handlersRef.current.onTap?.()
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleUp)
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleUp)
    window.addEventListener('touchcancel', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleUp)
      window.removeEventListener('touchcancel', handleUp)
    }
  }, [dragging])

  const handleStart = useCallback((clientY: number) => {
    startYRef.current = clientY
    movedRef.current = 0
    maxAbsMovedRef.current = 0
    draggingRef.current = true
    setDragging(true)
    handlersRef.current.onDragStart?.()
  }, [])

  const bind: DragSheetBindings = {
    onMouseDown: (e) => {
      e.preventDefault()
      handleStart(e.clientY)
    },
    onTouchStart: (e) => {
      handleStart(e.touches[0].clientY)
    }
  }

  return { dragging, bind }
}

interface DragHandleProps extends DragSheetHandlers {
  collapsed: boolean
  /** Tap-toggle: drag down past threshold collapses to a thin handle. */
  onCollapse: () => void
  /** Tap-toggle: drag up past threshold expands the sheet. */
  onExpand: () => void
}

/**
 * Mobile drag handle for the pinned chat sheet.
 *
 * - When the parent does NOT pass live drag handlers
 *   (`onDragStart`/`onDrag`/`onDragEnd`), the handle uses its built-in
 *   threshold logic: dragging more than `DRAG_THRESHOLD_PX` collapses or
 *   expands.
 * - When the parent DOES pass live drag handlers, the handle defers
 *   resize/snap to the parent and just forwards drag events. Tap toggles
 *   between collapsed / expanded as a fallback affordance.
 */
export function DragHandle({
  collapsed,
  onCollapse,
  onExpand,
  onDragStart,
  onDrag,
  onDragEnd
}: DragHandleProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')

  const isControlledByParent =
    onDragStart != null || onDrag != null || onDragEnd != null

  const toggleCollapsed = useCallback(() => {
    if (collapsed) {
      onExpand()
    } else {
      onCollapse()
    }
  }, [collapsed, onCollapse, onExpand])

  // When the parent owns snap, tapping the collapsed handle is
  // intentionally a no-op — expanding requires an actual upward drag so
  // a stray pointer tap on the thin strip can't accidentally pop the
  // sheet open. Keyboard Enter/Space still toggles for accessibility.
  const handlePointerTap = useCallback(() => {
    if (isControlledByParent && collapsed) return
    toggleCollapsed()
  }, [isControlledByParent, collapsed, toggleCollapsed])

  // Defer max-displacement tracking + threshold-fallback to the shared hook
  // so the synthetic-click-after-drag-then-return path is fixed everywhere.
  const handleDragEnd = useCallback(
    (deltaY: number) => {
      onDragEnd?.(deltaY)
      if (isControlledByParent) return
      if (deltaY > DRAG_THRESHOLD_PX) {
        onCollapse()
      } else if (deltaY < -DRAG_THRESHOLD_PX) {
        onExpand()
      }
    },
    [onDragEnd, isControlledByParent, onCollapse, onExpand]
  )

  const { dragging, bind } = useDragSheet({
    onDragStart,
    onDrag,
    onDragEnd: handleDragEnd,
    onTap: handlePointerTap
  })

  // Keyboard accessibility: Enter/Space toggles between expanded and
  // collapsed so non-pointer users still have a way to control the sheet.
  const handleKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      if (e.key !== 'Enter' && e.key !== ' ') return
      e.preventDefault()
      toggleCollapsed()
    },
    [toggleCollapsed]
  )

  return (
    <Box
      data-testid="ChatDragHandle"
      role="button"
      tabIndex={0}
      aria-label={collapsed ? t('Expand chat') : t('Collapse chat')}
      aria-expanded={!collapsed}
      onMouseDown={bind.onMouseDown}
      onTouchStart={bind.onTouchStart}
      onKeyDown={handleKeyDown}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 32,
        cursor: dragging ? 'grabbing' : 'grab',
        flexShrink: 0,
        touchAction: 'none',
        userSelect: 'none',
        outline: 'none',
        '&:focus-visible .ChatDragHandlePill': {
          bgcolor: TEXT_SECONDARY
        }
      }}
    >
      <Box
        className="ChatDragHandlePill"
        aria-hidden
        sx={{
          width: 48,
          height: 4,
          borderRadius: 9999,
          bgcolor: dragging ? TEXT_SECONDARY : DIVIDER,
          transition: 'background-color 120ms ease'
        }}
      />
    </Box>
  )
}
