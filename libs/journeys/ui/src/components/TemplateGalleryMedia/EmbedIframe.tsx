import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import { embedAttrs } from './embedAttrs'

interface EmbedIframeProps {
  /** Server-normalized (or client-normalized) embeddable URL. */
  embedUrl: string
  /** Accessible iframe title. */
  title: string
  /** MUI border-radius token for the inner frame. */
  borderRadius?: number
  /**
   * Test id applied to the outer (centering) wrapper; the iframe gets
   * `${testId}Iframe`.
   */
  testId: string
  /**
   * Caps the embed height (px) and centres it. Width is derived from the
   * host aspect ratio (so the frame keeps its shape) and the embed shrinks
   * responsively below that on narrow screens. Omit for full width.
   */
  maxHeight?: number
  /**
   * Fill the parent container (width + height 100%) instead of rendering at
   * the host's intrinsic aspect ratio. The embedded player letterboxes its own
   * content inside. Used by the compact field box, which has a fixed size.
   */
  fill?: boolean
  /**
   * Fired when the iframe's document finishes loading. Consumers use it to
   * dismiss loading affordances (the event fires for cross-origin documents
   * too — only the content stays opaque).
   */
  onLoad?: () => void
}

/**
 * Renders an embed URL in a responsive, centred iframe with the host-derived
 * `allow` / `referrerPolicy` / `sandbox` attributes from `embedAttrs`.
 * Single-sourced so the public gallery renderer and the admin preview cannot
 * drift on the security-sensitive iframe wiring.
 */
export function EmbedIframe({
  embedUrl,
  title,
  borderRadius = 1,
  testId,
  maxHeight,
  fill = false,
  onLoad
}: EmbedIframeProps): ReactElement {
  const attrs = embedAttrs(embedUrl)
  // aspectRatioPaddingTop is height-as-%-of-width (e.g. '56.25%').
  const fraction = parseFloat(attrs.aspectRatioPaddingTop) / 100
  // Use the CSS `aspect-ratio` property (relative to the element's OWN width)
  // rather than a `padding-top` percentage (which resolves against the
  // containing block's width, so a capped element would render far too tall).
  const aspectRatio = `100 / ${parseFloat(attrs.aspectRatioPaddingTop)}`
  // A height cap maps to a width cap of maxHeight / fraction, preserving ratio.
  const maxWidth =
    maxHeight != null && fraction > 0
      ? Math.round(maxHeight / fraction)
      : undefined

  return (
    <Box
      data-testid={testId}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        ...(fill && { height: '100%' })
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          ...(fill ? { height: '100%' } : { maxWidth, aspectRatio }),
          borderRadius,
          overflow: 'hidden'
        }}
      >
        <Box
          component="iframe"
          data-testid={`${testId}Iframe`}
          src={embedUrl}
          title={title}
          onLoad={onLoad}
          allow={attrs.allow}
          allowFullScreen={attrs.allowFullScreen}
          referrerPolicy={attrs.referrerPolicy}
          sandbox={attrs.sandbox}
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            border: 0
          }}
        />
      </Box>
    </Box>
  )
}
