import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import { embedAttrs } from './embedAttrs'

interface EmbedIframeProps {
  /** Server-normalized (or client-normalized) embeddable URL. */
  embedUrl: string
  /** Accessible iframe title. */
  title: string
  /** MUI border-radius token for the wrapper. */
  borderRadius?: number
  /**
   * Test id applied to the aspect-ratio wrapper; the iframe gets
   * `${testId}Iframe`.
   */
  testId: string
}

/**
 * Renders an embed URL in a responsive aspect-ratio iframe with the
 * host-derived `allow` / `referrerPolicy` / `sandbox` attributes from
 * `embedAttrs`. Single-sourced so the public gallery renderer and the admin
 * preview cannot drift on the security-sensitive iframe wiring.
 */
export function EmbedIframe({
  embedUrl,
  title,
  borderRadius = 1,
  testId
}: EmbedIframeProps): ReactElement {
  const attrs = embedAttrs(embedUrl)
  return (
    <Box
      data-testid={testId}
      sx={{
        position: 'relative',
        width: '100%',
        paddingTop: attrs.aspectRatioPaddingTop,
        borderRadius,
        overflow: 'hidden'
      }}
    >
      <Box
        component="iframe"
        data-testid={`${testId}Iframe`}
        src={embedUrl}
        title={title}
        allow={attrs.allow}
        allowFullScreen={attrs.allowFullScreen}
        referrerPolicy={attrs.referrerPolicy}
        sandbox={attrs.sandbox}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 0
        }}
      />
    </Box>
  )
}
