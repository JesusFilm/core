import { ApolloQueryResult } from '@apollo/client'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import NextLink from 'next/link'
import { ReactElement, useEffect, useRef } from 'react'

import {
  GetJourneysAdmin,
  GetJourneysAdmin_journeys as Journey
} from '../../../../__generated__/GetJourneysAdmin'

import { JourneyCardInfo } from './JourneyCardInfo'
import { JourneyCardMenu } from './JourneyCardMenu'
import { JourneyCardText } from './JourneyCardText'
import { JourneyCardVariant } from './journeyCardVariant'

interface JourneyCardProps {
  journey?: Journey
  duplicatedJourneyId?: string
  variant?: JourneyCardVariant
  refetch?: () => Promise<ApolloQueryResult<GetJourneysAdmin>>
}

export function JourneyCard({
  journey,
  duplicatedJourneyId,
  variant = JourneyCardVariant.default,
  refetch
}: JourneyCardProps): ReactElement {
  const duplicatedJourneyRef = useRef<HTMLDivElement>(null)

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
        journey?.id === duplicatedJourneyId ? duplicatedJourneyRef : undefined
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
    >
      <>
        <NextLink
          href={journey != null ? `/journeys/${journey.id}` : ''}
          passHref
          legacyBehavior
        >
          <CardActionArea>
            <CardContent
              sx={{
                px: 6,
                py: 4
              }}
            >
              <JourneyCardText journey={journey} variant={variant} />
            </CardContent>
          </CardActionArea>
        </NextLink>
        <CardActions
          sx={{
            px: 6,
            pb: 4
          }}
        >
          <JourneyCardInfo journey={journey} variant={variant} />
          {journey != null && (
            <JourneyCardMenu
              id={journey.id}
              status={journey.status}
              slug={journey.slug}
              published={journey.publishedAt != null}
              refetch={refetch}
            />
          )}
        </CardActions>
      </>
    </Card>
  )
}
