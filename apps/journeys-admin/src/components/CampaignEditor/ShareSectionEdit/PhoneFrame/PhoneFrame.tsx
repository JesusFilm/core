import Box from '@mui/material/Box'
import { ReactElement, ReactNode } from 'react'

interface PhoneFrameProps {
  children: ReactNode
}

/** The public phone's screen width (300px frame less the bezel); the canvas iframe renders at this width and scales. */
export const PUBLIC_SCREEN_WIDTH = 284
export const PUBLIC_SCREEN_HEIGHT = 584
/** The canvas phone's screen (220px frame less the 6px bezel), at the public screen's aspect. */
export const CANVAS_SCREEN_WIDTH = 208
export const CANVAS_SCREEN_HEIGHT = Math.round(
  (PUBLIC_SCREEN_HEIGHT * CANVAS_SCREEN_WIDTH) / PUBLIC_SCREEN_WIDTH
)
export const CANVAS_BEZEL = 6

/** The phone-shaped frame the public page previews a journey in; on the canvas it also holds the empty states. */
export function PhoneFrame({ children }: PhoneFrameProps): ReactElement {
  return (
    <Box
      data-testid="ShareLanguagePhone"
      sx={{
        position: 'relative',
        // Fixed sizes rather than an aspect ratio: in a column layout the
        // scaled iframe's unscaled box would otherwise stretch the frame.
        width: CANVAS_SCREEN_WIDTH + CANVAS_BEZEL * 2,
        height: CANVAS_SCREEN_HEIGHT + CANVAS_BEZEL * 2,
        flexShrink: 0,
        // The journey embed rounds itself at 16px; scaled to the canvas that
        // is 12px, so the screen clips there and the bezel adds its 6px.
        p: `${CANVAS_BEZEL}px`,
        borderRadius: '18px',
        backgroundColor: 'var(--campaign-band-heading)'
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: CANVAS_SCREEN_WIDTH,
          height: CANVAS_SCREEN_HEIGHT,
          borderRadius: '12px',
          overflow: 'hidden',
          clipPath: 'inset(0 round 12px)',
          backgroundColor: 'var(--campaign-band-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {children}
      </Box>
      <Box
        aria-hidden
        data-testid="ShareLanguagePhoneBezel"
        sx={{
          // A composited iframe escapes the screen's rounded clip on some
          // displays, so the bezel is also painted over the screen's corners
          // from above. This must sit outside the clipping box: a spread
          // shadow inside it would be clipped away with the corners.
          position: 'absolute',
          inset: `${CANVAS_BEZEL}px`,
          borderRadius: '12px',
          boxShadow: `0 0 0 ${CANVAS_BEZEL}px var(--campaign-band-heading)`,
          pointerEvents: 'none',
          zIndex: 1
        }}
      />
    </Box>
  )
}
