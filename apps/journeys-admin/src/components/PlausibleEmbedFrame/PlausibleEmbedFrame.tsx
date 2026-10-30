import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import {
  type ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'

const StyledIFrame = styled('iframe')({
  border: 0
})

/** A ref callback that adds `/plausible.css` to the embedded dashboard each time it loads. */
function usePlausibleStylesheetRef(): (node: HTMLIFrameElement | null) => void {
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

/**
 * Where a report's dashboard stands: its token still loading, the load
 * failed, loaded with no token because the site is not created yet, or
 * ready with the site's shared-link token.
 */
export type PlausibleEmbedStatus =
  | { state: 'loading' }
  | { state: 'error' }
  | { state: 'settingUp' }
  | { state: 'ready'; token: string }

/**
 * A report query's result as a `PlausibleEmbedStatus`. `data` is the record
 * the query read the token from (the journey, the campaign): with no record
 * yet the report is still loading; a record with no token means its site is
 * still being set up.
 */
export function plausibleEmbedStatus({
  loading,
  error,
  data
}: {
  loading: boolean
  error?: unknown
  data?: { plausibleToken: string | null } | null
}): PlausibleEmbedStatus {
  if (loading) return { state: 'loading' }
  if (error != null) return { state: 'error' }
  if (data == null) return { state: 'loading' }
  if (data.plausibleToken == null) return { state: 'settingUp' }
  return { state: 'ready', token: data.plausibleToken }
}

interface PlausibleEmbedFrameProps {
  /** The Plausible site shown, e.g. `api-journeys-journey-<id>`. */
  siteId: string
  status: PlausibleEmbedStatus
  host?: string // for testing
}

/**
 * A Plausible site's own dashboard, embedded through its shared link (proxied
 * by the admin's `/share` and `/api/stats` rewrites) and restyled with
 * `/plausible.css`. Until it has drawn, a message covers it: loading, the
 * load failed, or the site is still being set up (loaded with no token).
 */
export function PlausibleEmbedFrame({
  siteId,
  status,
  host
}: PlausibleEmbedFrameProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [showDashboard, setShowDashboard] = useState(false)
  const revealTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const ref = usePlausibleStylesheetRef()

  // A report that leaves `ready` (reloading, failing) drops its frame, so
  // cover the space with its message again and forget any pending reveal.
  useEffect(() => {
    if (status.state === 'ready') return
    clearTimeout(revealTimer.current)
    setShowDashboard(false)
  }, [status.state])

  useEffect(() => () => clearTimeout(revealTimer.current), [])
  const message = {
    loading: t('The report is loading...'),
    ready: t('The report is loading...'),
    error: t('There was an error loading the report'),
    settingUp: t('The report is being set up. Check back in a few minutes.')
  }[status.state]

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
            {message}
          </Typography>
        </Box>
      </Fade>

      {status.state === 'ready' && (
        <>
          <StyledIFrame
            data-testid="PlausibleEmbedFrame"
            plausible-embed
            src={`${host ?? ''}/share/${siteId}?auth=${status.token}&embed=true&theme=light&background=transparent`}
            loading="lazy"
            onLoad={() => {
              clearTimeout(revealTimer.current)
              revealTimer.current = setTimeout(() => {
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
