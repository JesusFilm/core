'use client'

import Box from '@mui/material/Box'
import { SxProps } from '@mui/material/styles'
import dynamic from 'next/dynamic'
import {
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'

import { useJourney } from '../../libs/JourneyProvider'
import type { AiChatSheetState } from '../AiChat/AiChat'
import {
  DIVIDER,
  HEADER_WASH,
  INPUT_FILL,
  SHEET_TOP_SHADOW,
  SPARKLE_AVATAR_SHADOW,
  SPARKLE_GRADIENT,
  SURFACE
} from '../AiChat/chatStyles'

/**
 * Lightweight visual placeholder rendered while the dynamically-imported
 * AiChat chunk is loading. Mirrors the idle-state layout (handle, header
 * row, input row) so on slow devices we show a near-final shell instead
 * of an empty white box. No interactivity — the real AiChat takes over
 * once the chunk lands.
 */
function ChatLoadingSkeleton(): ReactElement {
  return (
    <Box
      data-testid="PinnedChatBarSkeleton"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}
    >
      <Box sx={{ background: HEADER_WASH, flexShrink: 0 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: '14px'
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 4,
              borderRadius: 9999,
              bgcolor: DIVIDER
            }}
          />
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            pt: 1,
            pb: 1.5,
            px: 1.75,
            borderBottom: '1px solid',
            borderBottomColor: DIVIDER,
            flexShrink: 0
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: SPARKLE_GRADIENT,
              boxShadow: SPARKLE_AVATAR_SHADOW,
              flexShrink: 0
            }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                width: 110,
                height: 12,
                borderRadius: 4,
                bgcolor: DIVIDER,
                mb: 0.75
              }}
            />
            <Box
              sx={{
                width: 150,
                height: 10,
                borderRadius: 4,
                bgcolor: DIVIDER,
                opacity: 0.7
              }}
            />
          </Box>
        </Box>
      </Box>
      <Box sx={{ flex: 1 }} />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          p: 1.5,
          flexShrink: 0
        }}
      >
        <Box
          sx={{
            flex: 1,
            height: 44,
            bgcolor: INPUT_FILL,
            borderRadius: '22px'
          }}
        />
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            bgcolor: DIVIDER,
            flexShrink: 0
          }}
        />
      </Box>
    </Box>
  )
}

const AiChat = dynamic(
  async () =>
    await import(/* webpackChunkName: 'ai-chat' */ '../AiChat').then(
      (mod) => mod.AiChat
    ),
  { ssr: false, loading: () => <ChatLoadingSkeleton /> }
)

interface PinnedChatBarProps {
  sx?: SxProps
}

// Pixel height for the collapsed/minimized state. 32px = the drag handle's
// 14px top + 4px thumb + 14px bottom padding. Below this only the handle
// is visible — content above (header / conversation / input) is clipped
// by the sheet's overflow:hidden.
const COLLAPSED_HEIGHT_PX = 32
// Pixel height for the idle (no messages, expanded) state. Handle (32)
// + ChatHeader (~64) + input (~68) + a little breathing room. Used so
// the open/close animation has explicit numeric endpoints to
// interpolate between when transitioning out of `auto` height.
const IDLE_HEIGHT_PX = 168
// Snap fractions of the parent height. Drop the 50% stop — drag straight
// from minimized to large or full.
const SNAP_LARGE = 0.8
const SNAP_FULL = 1
// Soft snap animation: a strong ease-out curve so the sheet glides
// quickly off the start position and decelerates as it approaches the
// snap target — feels natural at the top/bottom limits.
const SNAP_TRANSITION = 'height 780ms cubic-bezier(0.16, 1, 0.3, 1)'
const TOGGLE_TRANSITION = 'height 480ms cubic-bezier(0.16, 1, 0.3, 1)'
const SNAP_DURATION_MS = 800
// While the user is actively dragging we want the height to track the
// finger 1:1 — disable transitions during drag so each frame applies
// instantly. Animation is re-enabled on release for the snap.
const NO_TRANSITION = 'none'

export function PinnedChatBar({ sx }: PinnedChatBarProps): ReactElement | null {
  const { variant } = useJourney()
  const [sheetState, setSheetState] = useState<AiChatSheetState>('idle')
  const [collapsed, setCollapsed] = useState(false)
  // Live-drag height as a fraction of the parent (0..1). null means "fall
  // back to the default height for the current sheetState".
  const [heightPct, setHeightPct] = useState<number | null>(null)
  // True while the snap animation is playing after release. Prevents the
  // snap transition from clobbering the live drag tracking.
  const [animating, setAnimating] = useState(false)
  const [dragging, setDragging] = useState(false)
  const sheetRef = useRef<HTMLDivElement | null>(null)
  const dragStartRef = useRef<{ parentH: number; startPct: number }>({
    parentH: 0,
    startPct: 0
  })
  // Latches once the chat has auto-expanded for the first message so we
  // don't replay the auto-expand effect when sheetState toggles back to
  // 'active' after a collapse → re-open cycle.
  const hasAutoExpandedRef = useRef(false)
  const animationTimerRef = useRef<number | null>(null)

  const handleSheetStateChange = useCallback((next: AiChatSheetState) => {
    setSheetState(next)
  }, [])

  const playSnapAnimation = useCallback(() => {
    if (animationTimerRef.current != null) {
      window.clearTimeout(animationTimerRef.current)
    }
    setAnimating(true)
    animationTimerRef.current = window.setTimeout(() => {
      setAnimating(false)
      animationTimerRef.current = null
    }, SNAP_DURATION_MS)
  }, [])

  // Tap-toggle on the drag handle (or AiChat-internal collapse callbacks)
  // — sync the snap height so the resize animation stays consistent with
  // tap-driven transitions.
  const handleCollapsedChange = useCallback(
    (next: boolean) => {
      setCollapsed(next)
      const parent = sheetRef.current?.parentElement as HTMLElement | null
      const parentH = parent?.clientHeight ?? 0
      if (parentH <= 0) {
        setHeightPct(null)
        return
      }
      const min = COLLAPSED_HEIGHT_PX / parentH
      playSnapAnimation()
      // Tap-expand always lands at the large stop. Full is only reachable
      // by an explicit drag-up from large.
      setHeightPct(next ? min : SNAP_LARGE)
    },
    [playSnapAnimation]
  )

  const minSnapFor = useCallback(
    (parentH: number): number =>
      parentH > 0 ? COLLAPSED_HEIGHT_PX / parentH : 0,
    []
  )

  const handleDragStart = useCallback(() => {
    const sheet = sheetRef.current
    const parent = sheet?.offsetParent as HTMLElement | null
    const parentH = parent?.clientHeight ?? sheet?.parentElement?.clientHeight
    const resolvedParentH = parentH ?? 0
    const sheetH = sheet?.offsetHeight ?? 0
    const currentPct = resolvedParentH > 0 ? sheetH / resolvedParentH : 0
    dragStartRef.current = {
      parentH: resolvedParentH,
      startPct: currentPct
    }
    if (animationTimerRef.current != null) {
      window.clearTimeout(animationTimerRef.current)
      animationTimerRef.current = null
    }
    setAnimating(false)
    setDragging(true)
  }, [])

  const handleDrag = useCallback(
    (deltaY: number) => {
      const { parentH, startPct } = dragStartRef.current
      if (parentH <= 0) return
      // Dragging DOWN (+deltaY) shrinks the sheet; UP grows it.
      const next = startPct - deltaY / parentH
      const clamped = Math.max(
        minSnapFor(parentH),
        Math.min(SNAP_FULL, next)
      )
      setHeightPct(clamped)
    },
    [minSnapFor]
  )

  const handleDragEnd = useCallback(
    (deltaY: number) => {
      setDragging(false)
      const { parentH, startPct } = dragStartRef.current
      if (parentH <= 0) return
      const finalPx = sheetRef.current?.offsetHeight ?? 0
      const finalPct = finalPx / parentH
      const minPct = minSnapFor(parentH)

      // Special-case behaviours requested by the design:
      //  - From minimized + ANY upward drag → snap to large (first time)
      //    or full (every re-open after that).
      //  - From large/full + ANY downward drag → collapse to minimized.
      //  - Otherwise → snap to whichever stop the finger is closest to.
      const startedMinimized = startPct <= minPct + 0.01
      const startedLarge = Math.abs(startPct - SNAP_LARGE) < 0.04
      const startedFull = Math.abs(startPct - SNAP_FULL) < 0.04
      const startedAtSnap = startedMinimized || startedLarge || startedFull
      let nearest: number
      if (startedMinimized && deltaY < -4) {
        // Re-expand from minimized always lands at the large stop —
        // full is only reachable by an explicit drag-up from there.
        nearest = SNAP_LARGE
      } else if ((startedLarge || startedFull) && deltaY > 4) {
        nearest = minPct
      } else if (!startedAtSnap && deltaY < -4) {
        // Started at the idle (between-stops) height. Treat any upward
        // drag as an expand intent.
        nearest = SNAP_LARGE
      } else if (!startedAtSnap && deltaY > 4) {
        nearest = minPct
      } else {
        const stops = [minPct, SNAP_LARGE, SNAP_FULL]
        nearest = stops.reduce((best, stop) =>
          Math.abs(stop - finalPct) < Math.abs(best - finalPct) ? stop : best
        )
      }

      playSnapAnimation()
      setHeightPct(nearest)
      // Mirror the snap target into the controlled `collapsed` state so
      // AiChat slides the input out (or back in) in lockstep with the
      // height tween.
      setCollapsed(Math.abs(nearest - minPct) < 0.01)
    },
    [minSnapFor, playSnapAnimation]
  )

  // When AiChat reports the chat just became active (first message sent),
  // auto-expand to the large stop. Latching `hasAutoExpandedRef` so we
  // only do this once — subsequent collapse → re-open transitions are
  // driven by drag (or tap-expand), which always land at large too.
  useEffect(() => {
    if (sheetState !== 'active') return
    if (heightPct != null) return
    if (hasAutoExpandedRef.current) return
    hasAutoExpandedRef.current = true
    playSnapAnimation()
    setHeightPct(SNAP_LARGE)
  }, [sheetState, heightPct, playSnapAnimation])

  useEffect(() => {
    return () => {
      if (animationTimerRef.current != null) {
        window.clearTimeout(animationTimerRef.current)
      }
    }
  }, [])

  if (variant === 'admin' || variant === 'embed') {
    return null
  }

  // Resolve final visible height. While the user is dragging or the
  // height has been snapped explicitly, honour `heightPct`. Otherwise
  // fall back to the per-state defaults.
  let height: string
  let transition: string
  if (heightPct != null) {
    height = `${heightPct * 100}%`
    transition = dragging
      ? NO_TRANSITION
      : animating
        ? SNAP_TRANSITION
        : TOGGLE_TRANSITION
  } else if (sheetState === 'active') {
    height = `${SNAP_LARGE * 100}%`
    transition = TOGGLE_TRANSITION
  } else if (sheetState === 'collapsed') {
    height = `${COLLAPSED_HEIGHT_PX}px`
    transition = TOGGLE_TRANSITION
  } else {
    height = `${IDLE_HEIGHT_PX}px`
    transition = TOGGLE_TRANSITION
  }

  return (
    <Box
      ref={sheetRef}
      data-testid="PinnedChatBar"
      data-sheet-state={sheetState}
      sx={{
        position: 'absolute',
        zIndex: 1,
        bottom: 0,
        left: 0,
        right: 0,
        height,
        // No maxHeight: it would clamp instantly on state change and short-
        // circuit the height transition (collapse looked instant before this).
        // Drag-driven collapse/expand animates between explicit numeric
        // heights via CSS rather than position-tracking, per product spec.
        transition,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        bgcolor: SURFACE,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        boxShadow: SHEET_TOP_SHADOW,
        pb: 'env(safe-area-inset-bottom)',
        ...sx
      }}
    >
      <AiChat
        onSheetStateChange={handleSheetStateChange}
        collapsed={collapsed}
        onCollapsedChange={handleCollapsedChange}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
      />
    </Box>
  )
}
