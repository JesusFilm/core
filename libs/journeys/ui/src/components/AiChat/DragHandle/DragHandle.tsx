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

import { DIVIDER, TEXT_SECONDARY } from '../tokens'

interface DragHandleProps {
  collapsed: boolean
  onToggle: () => void
  /** Called when the user drags the handle down past the threshold. */
  onCollapse: () => void
}

const DRAG_COLLAPSE_THRESHOLD_PX = 32
const TAP_THRESHOLD_PX = 4

export function DragHandle({
  collapsed,
  onToggle,
  onCollapse
}: DragHandleProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  const [dragging, setDragging] = useState(false)
  const startYRef = useRef<number | null>(null)
  const movedRef = useRef(0)
  const draggingRef = useRef(false)

  useEffect(() => {
    if (!dragging) return undefined
    const handleMouseMove = (e: MouseEvent): void => {
      if (startYRef.current == null) return
      movedRef.current = e.clientY - startYRef.current
    }
    const handleTouchMove = (e: TouchEvent): void => {
      if (startYRef.current == null || e.touches.length === 0) return
      movedRef.current = e.touches[0].clientY - startYRef.current
    }
    const handleUp = (): void => {
      if (!draggingRef.current) return
      const moved = movedRef.current
      draggingRef.current = false
      setDragging(false)
      startYRef.current = null
      movedRef.current = 0
      if (moved > DRAG_COLLAPSE_THRESHOLD_PX) {
        onCollapse()
      } else if (Math.abs(moved) < TAP_THRESHOLD_PX) {
        onToggle()
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleUp)
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchend', handleUp)
    window.addEventListener('touchcancel', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleUp)
      window.removeEventListener('touchcancel', handleUp)
    }
  }, [dragging, onCollapse, onToggle])

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

  const handleKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onToggle()
      }
    },
    [onToggle]
  )

  return (
    <Box
      data-testid="ChatDragHandle"
      role="button"
      tabIndex={0}
      aria-label={collapsed ? t('Expand chat') : t('Collapse chat')}
      aria-expanded={!collapsed}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onKeyDown={handleKeyDown}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        py: '14px',
        cursor: dragging ? 'grabbing' : 'grab',
        flexShrink: 0,
        touchAction: 'none',
        userSelect: 'none',
        outline: 'none',
        '&:focus-visible .ChatDragHandleThumb': {
          bgcolor: TEXT_SECONDARY
        }
      }}
    >
      <Box
        className="ChatDragHandleThumb"
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
