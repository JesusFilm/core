import { ApolloQueryResult } from '@apollo/client'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import NextLink from 'next/link'
import { ReactElement, useEffect, useRef } from 'react'

import { useNavigationState } from '@core/journeys/ui/useNavigationState'

import {
  GetAdminJourneys,
  GetAdminJourneys_journeys as Journey
} from '../../../../__generated__/GetAdminJourneys'

import { JourneyCardInfo } from './JourneyCardInfo'
import { JourneyCardMenu } from './JourneyCardMenu'
import { JourneyCardText } from './JourneyCardText'
import { JourneyCardVariant } from './journeyCardVariant'

interface JourneyCardProps {
  journey: Journey
  duplicatedJourneyId?: string
  variant?: JourneyCardVariant
  refetch?: () => Promise<ApolloQueryResult<GetAdminJourneys>>
}

/**
 * JourneyCard component displays a journey card with information and actions.
 * It allows users to navigate to the journey details page and view the journey card.
 *
 * @param {JourneyCardProps} props - The component props
 * @param {Journey} props.journey - The journey data object
 * @param {string} [props.duplicatedJourneyId] - The ID of the duplicated journey
 * @param {JourneyCardVariant} [props.variant] - The variant of the journey card
 * @param {() => Promise<ApolloQueryResult<GetAdminJourneys>>} [props.refetch] - Function to refetch journey data
 * @returns {ReactElement} A journey card component
 */

export function JourneyCard({
  journey,
  duplicatedJourneyId,
  variant = JourneyCardVariant.default,
  refetch
}: JourneyCardProps): ReactElement {
  const duplicatedJourneyRef = useRef<HTMLDivElement>(null)
  const isNavigating = useNavigationState()

  useEffect(() => {
    if (duplicatedJourneyId != null && duplicatedJourneyRef.current != null) {
      duplicatedJourneyRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, [duplicatedJourneyId, journey])

  return (
    <Card
      ref={
        journey.id === duplicatedJourneyId ? duplicatedJourneyRef : undefined
      }
      aria-label="journey-card"
      variant="outlined"
      sx={{
        borderRadius: 0,
        borderColor: 'divider',
        borderBottom: 'none',
        '&:last-of-type': {
          borderBottomLeftRadius: { xs: 0, sm: 12 },
          borderBottomRightRadius: { xs: 0, sm: 12 },
          borderBottom: '1px solid',
          borderColor: 'divider'
        }
      }}
      data-testid={`JourneyCard-${journey.id}`}
    >
      <>
        <NextLink
          href={`/journeys/${journey.id}`}
          passHref
          legacyBehavior
          prefetch={false}
        >
          <CardActionArea
            disabled={isNavigating}
            sx={{ borderRadius: 0, opacity: isNavigating ? 0.5 : 1 }}
          >
            <CardContent sx={{ px: 6, py: 4 }}>
              <JourneyCardText journey={journey} variant={variant} />
            </CardContent>
          </CardActionArea>
        </NextLink>
        <CardActions sx={{ px: 6, pb: 4 }}>
          <JourneyCardInfo journey={journey} variant={variant} />
          <JourneyCardMenu
            id={journey.id}
            status={journey.status}
            slug={journey.slug}
            published={journey.publishedAt != null}
            refetch={refetch}
            journey={journey}
          />
        </CardActions>
      </>
    </Card>
  )
}
