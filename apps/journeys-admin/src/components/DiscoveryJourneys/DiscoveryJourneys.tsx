import { gql, useQuery } from '@apollo/client'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Fade from '@mui/material/Fade'
import Stack from '@mui/material/Stack'
import { ReactElement, memo } from 'react'

import { BLOCK_FIELDS } from '@core/journeys/ui/block/blockFields'

import {
  GetDiscoveryJourneys_discoveryJourneys as DiscoveryJourney,
  GetDiscoveryJourneys
} from '../../../__generated__/GetDiscoveryJourneys'

import { EmbedJourney } from './EmbedJourney'

export const GET_DISCOVERY_JOURNEYS = gql`
  ${BLOCK_FIELDS}
  query GetDiscoveryJourneys($where: JourneysFilter) {
    discoveryJourneys: journeys(where: $where) {
      id
      seoTitle
      blocks {
        ...BlockFields
      }
    }
  }
`

const discoveryJourneyIds = [
  '336ea06f-c08a-4d27-9bb7-16336d1a1f98',
  'f76713ff-1ec0-499c-87fa-5aa394ca66cf',
  '22ff40a2-b3a3-48af-b48a-6f9ee600bf33'
]

export const DiscoveryJourneys = memo(
  function DiscoveryJourneys(): ReactElement {
    const { data } = useQuery<GetDiscoveryJourneys>(GET_DISCOVERY_JOURNEYS, {
      variables: {
        where: {
          ids: discoveryJourneyIds
        }
      }
    })

    const discoveryJourneys: DiscoveryJourney[] = []
    data?.discoveryJourneys.forEach((discoveryJourney) => {
      discoveryJourneys[discoveryJourneyIds.indexOf(discoveryJourney.id)] =
        discoveryJourney
    })

    return (
      <Container sx={{ px: { xs: 6, sm: 0 } }}>
        <Stack
          direction="row"
          spacing={{ xs: 2, sm: 8 }}
          sx={{ height: { xs: 200, sm: 340, md: 450 } }}
        >
          <Fade in timeout={1000}>
            <Box flexGrow={1} height="100%">
              <EmbedJourney
                slug="admin-left"
                discoveryJourney={discoveryJourneys[0]}
              />
            </Box>
          </Fade>
          <Fade in timeout={2000}>
            <Box flexGrow={1} height="100%">
              <EmbedJourney
                slug="admin-center"
                discoveryJourney={discoveryJourneys[1]}
              />
            </Box>
          </Fade>
          <Fade in timeout={3000}>
            <Box flexGrow={1} height="100%">
              <EmbedJourney
                slug="admin-right"
                discoveryJourney={discoveryJourneys[2]}
              />
            </Box>
          </Fade>
        </Stack>
      </Container>
    )
  }
)
