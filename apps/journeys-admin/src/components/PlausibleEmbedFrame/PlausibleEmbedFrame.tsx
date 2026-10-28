import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { type ReactElement, useCallback, useRef, useState } from 'react'

const StyledIFrame = styled('iframe')({
  border: 0
})

function useHookWithRefCallback(): (node: HTMLIFrameElement | null) => void {
  const ref = useRef<HTMLIFrameElement | null>(null)
  const setRef = useCallback((node: HTMLIFrameElement | null) => {
    function handleLoad(): void {
      if (node == null) return
      const cssLink = document.createElement('link')
      cssLink.href = '/plausible.css'
      cssLink.rel = 'stylesheet'
      cssLink.type = 'text/css'
      node.contentWindow?.document.head.appendChild(cssLink)
    }

    if (ref.current != null) {
      // Make sure to cleanup any events/references added to the last instance
      if (node != null) {
        node.removeEventListener('load', handleLoad)
      }
      ref.current = null
    }

    if (node != null) {
      // Check if a node is actually passed. Otherwise node would be null.
      // You can now do what you need to, addEventListeners, measure, etc.
      node.addEventListener('load', handleLoad)
    }

    // Save a reference to the node
    ref.current = node
  }, [])

  return setRef
}

interface PlausibleEmbedFrameProps {
  /** The Plausible site shown, e.g. `api-journeys-journey-<id>`. */
  siteId: string
  /** The site's shared-link token; the frame waits while it is null. */
  auth?: string | null
  /** Show the error message instead of the loading one. */
  error?: boolean
  host?: string // for testing
}

/**
 * A Plausible site's own dashboard, embedded through its shared link (proxied
 * by the admin's `/share` and `/api/stats` rewrites) and restyled with
 * `/plausible.css`. A loading or error message covers it until it has drawn.
 */
export function PlausibleEmbedFrame({
  siteId,
  auth,
  error = false,
  host
}: PlausibleEmbedFrameProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [showDashboard, setShowDashboard] = useState(false)
  const ref = useHookWithRefCallback()

  return (
    <>
      <Fade in={!showDashboard}>
        <Box
          sx={{
            justifyContent: 'center',
            alignItems: 'center',
            display: showDashboard ? 'none' : 'flex',
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            background: (theme) => theme.palette.background.default
          }}
        >
          <Typography
            variant="overline"
            sx={{
              color: 'secondary.light'
            }}
          >
            {error
              ? t('There was an error loading the report')
              : t('The report is loading...')}
          </Typography>
        </Box>
      </Fade>

      {auth != null && (
        <>
          <StyledIFrame
            data-testid="PlausibleEmbedDashboard"
            plausible-embed
            src={`${host ?? ''}/share/${siteId}?auth=${auth}&embed=true&theme=light&background=transparent`}
            loading="lazy"
            onLoad={() => {
              setTimeout(() => {
                // wait for css to load
                setShowDashboard(true)
              }, 1000)
            }}
            ref={ref}
            sx={{
              height: {
                xs: 'calc(100vh - 96px)',
                md: 'calc(100vh - 48px)'
              },
              width: '100%'
            }}
          />
          <script async src={`${host ?? ''}/js/embed.host.js`} />
        </>
      )}
    </>
  )
}
