import { useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
// eslint-disable-next-line import/no-named-as-default
import gql from 'graphql-tag'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { type ReactElement, useCallback, useRef, useState } from 'react'

import { JOURNEY_FIELDS } from '@core/journeys/ui/JourneyProvider/journeyFields'

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

interface PlausibleEmbedDashboardProps {
  host?: string // for testing
}

export function PlausibleEmbedDashboard({
  host
}: PlausibleEmbedDashboardProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [showDashboard, setShowDashboard] = useState(false)
  const router = useRouter()
  const ref = useHookWithRefCallback()

  const { data, loading, error } = useQuery<
    GetAdminJourneyWithPlausibleToken,
    GetAdminJourneyWithPlausibleTokenVariables
  >(GET_ADMIN_JOURNEY_WITH_PLAUSIBLE_TOKEN, {
    variables: { id: router.query.journeyId as string }
  })

  const journeyId = router.query.journeyId as string

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
            src={`${host ?? ''}/share/api-journeys-journey-${journeyId}?auth=${
              data?.journey.plausibleToken
            }&embed=true&theme=light&background=transparent`}
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
