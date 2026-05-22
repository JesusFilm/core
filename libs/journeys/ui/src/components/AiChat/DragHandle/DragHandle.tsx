import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded'
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

interface DragHandleProps {
  collapsed: boolean
  /** Drag down past the threshold collapses the sheet to a thin handle. */
  onCollapse: () => void
  /** Drag up past the threshold expands the sheet back to active height. */
  onExpand: () => void
}

const DRAG_THRESHOLD_PX = 32

export function DragHandle({
  collapsed,
  onCollapse,
  onExpand
}: DragHandleProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  const [dragging, setDragging] = useState(false)
  const startYRef = useRef<number | null>(null)
  const movedRef = useRef(0)
  const draggingRef = useRef(false)
  const suppressClickRef = useRef(false)

  const toggleCollapsed = useCallback(() => {
    if (collapsed) {
      onExpand()
    } else {
      onCollapse()
    }
  }, [collapsed, onCollapse, onExpand])

  useEffect(() => {
    if (!dragging) return undefined
    const handleMouseMove = (e: MouseEvent): void => {
      if (startYRef.current == null) return
      movedRef.current = e.clientY - startYRef.current
    }
    const handleTouchMove = (e: TouchEvent): void => {
      if (startYRef.current == null || e.touches.length === 0) return
      movedRef.current = e.touches[0].clientY - startYRef.current
      // Stop the page (or the conversation underneath) from scrolling
      // while the user is dragging the handle.
      e.preventDefault()
    }
    const handleUp = (): void => {
      if (!draggingRef.current) return
      const moved = movedRef.current
      draggingRef.current = false
      setDragging(false)
      startYRef.current = null
      movedRef.current = 0
      if (moved > DRAG_THRESHOLD_PX) {
        suppressClickRef.current = true
        onCollapse()
      } else if (moved < -DRAG_THRESHOLD_PX) {
        suppressClickRef.current = true
        onExpand()
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
  }, [dragging, onCollapse, onExpand])

  const handleStart = useCallback((clientY: number) => {
    startYRef.current = clientY
    movedRef.current = 0
    draggingRef.current = true
    setDragging(true)
  }, [])

  const handleMouseDown = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      e.preventDefault()
      handleStart(e.clientY)
    },
    [handleStart]
  )

  const handleTouchStart = useCallback(
    (e: ReactTouchEvent<HTMLDivElement>) => {
      handleStart(e.touches[0].clientY)
    },
    [handleStart]
  )

  const handleClick = useCallback(() => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }
    toggleCollapsed()
  }, [toggleCollapsed])

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

  const ChevronIcon = collapsed
    ? KeyboardArrowUpRoundedIcon
    : KeyboardArrowDownRoundedIcon

  return (
    <Box
      data-testid="ChatDragHandle"
      role="button"
      tabIndex={0}
      aria-label={collapsed ? t('Expand chat') : t('Collapse chat')}
      aria-expanded={!collapsed}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
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
          bgcolor: DIVIDER,
          color: TEXT_SECONDARY
        }
      }}
    >
      <Box
        component={ChevronIcon}
        className="ChatDragHandlePill"
        aria-hidden
        sx={{
          width: 28,
          height: 18,
          px: 0.5,
          borderRadius: 9999,
          color: dragging ? TEXT_SECONDARY : TEXT_SECONDARY,
          bgcolor: dragging ? DIVIDER : 'transparent',
          transition: 'background-color 120ms ease, color 120ms ease'
        }}
      />
    </Box>
  )
}
