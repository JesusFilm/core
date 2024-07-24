import { useQuery } from '@apollo/client'
import { JOURNEY_FIELDS } from '@core/journeys/ui/JourneyProvider/journeyFields'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import gql from 'graphql-tag'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { type ReactElement, useCallback, useRef } from 'react'
import type {
  GetAdminJourneyWithPlausibleToken,
  GetAdminJourneyWithPlausibleTokenVariables
} from '../../../__generated__/GetAdminJourneyWithPlausibleToken'

export const GET_ADMIN_JOURNEY_WITH_PLAUSIBLE_TOKEN = gql`
  ${JOURNEY_FIELDS}
  query GetAdminJourneyWithPlausibleToken($id: ID!) {
    journey: adminJourney(id: $id, idType: databaseId) {
      ...JourneyFields
      plausibleToken
    }
  }
`

const StyledIFrame = styled('iframe')({
  border: 0
})

function useHookWithRefCallback(): (node: HTMLIFrameElement | null) => void {
  const ref = useRef<HTMLIFrameElement | null>(null)
  const setRef = useCallback((node: HTMLIFrameElement | null) => {
    if (ref.current != null) {
      // Make sure to cleanup any events/references added to the last instance
    }

    if (node != null) {
      // Check if a node is actually passed. Otherwise node would be null.
      // You can now do what you need to, addEventListeners, measure, etc.
      node.addEventListener('load', () => {
        const cssLink = document.createElement('link')
        // cssLink.href = 'http://localhost:800/plausible.css'
        cssLink.href = '/plausible.css'
        cssLink.rel = 'stylesheet'
        cssLink.type = 'text/css'
        node.contentWindow?.document.head.appendChild(cssLink)
      })
    }

    // Save a reference to the node
    ref.current = node
  }, [])

  return setRef
}

interface PlausibleEmbedDashboardProps {
  host?: string // for testing
}

export function PlausibleEmbedDashboard({
  host
}: PlausibleEmbedDashboardProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const ref = useHookWithRefCallback()

  const { data, loading, error } = useQuery<
    GetAdminJourneyWithPlausibleToken,
    GetAdminJourneyWithPlausibleTokenVariables
  >(GET_ADMIN_JOURNEY_WITH_PLAUSIBLE_TOKEN, {
    variables: { id: router.query.journeyId as string }
  })

  const journeyId = router.query.journeyId as string
  const url = host ?? process.env.NEXT_PUBLIC_PLAUSIBLE_URL ?? ''

  return (
    <>
      <Fade in={loading === true || error != null}>
        <Box
          sx={{
            justifyContent: 'center',
            alignItems: 'center',
            display: !loading && error == null ? 'none' : 'flex',
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            background: (theme) => theme.palette.background.default
          }}
        >
          <Typography variant="overline" color="secondary.light">
            {error != null
              ? t('There was an error loading the report')
              : t('The report is loading...')}
          </Typography>
        </Box>
      </Fade>

      {!loading && data?.journey.plausibleToken != null && (
        <>
          <StyledIFrame
            data-testid="PlausibleEmbedDashboard"
            plausible-embed
            src={`/share/api-journeys-journey-${journeyId}?auth=${data?.journey.plausibleToken}&embed=true&theme=light&background=transparent`}
            // src={`${url}/share/api-journeys-journey-${journeyId}?auth=${data?.journey.plausibleToken}&embed=true&theme=light&background=transparent`}
            loading="lazy"
            ref={ref}
            sx={{
              height: {
                xs: 'calc(100vh - 96px)',
                md: 'calc(100vh - 48px)'
              },
              width: '100%'
            }}
          />
          <script async src={`/js/embed.host.js`} />
          {/* <script async src={`${url}/js/embed.host.js`} /> */}
        </>
      )}
    </>
  )
}
