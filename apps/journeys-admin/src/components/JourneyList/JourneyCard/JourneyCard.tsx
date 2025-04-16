import { ApolloQueryResult } from '@apollo/client'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Image from 'next/image'
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
          borderTopLeftRadius: { xs: 0, sm: 12 },
          borderTopRightRadius: { xs: 0, sm: 12 },
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
            <Box
              sx={{
                position: 'relative',
                width: 'auto',
                paddingTop: `${(158 / 208) * 100}%`,
                mx: 3,
                mt: 3,
                borderRadius: '5px',
                bgcolor: 'rgba(0, 0, 0, 0.1)'
              }}
            >
              {journey.primaryImageBlock?.src != null && (
                <Image
                  data-testid="JourneyCard-Image"
                  src={journey.primaryImageBlock.src}
                  alt={journey.primaryImageBlock.alt ?? ''}
                  fill
                  style={{
                    borderRadius: '5px',
                    objectFit: 'cover'
                  }}
                />
              )}
            </Box>
            <CardContent sx={{ px: 3, py: 3 }}>
              <JourneyCardText journey={journey} variant={variant} />
            </CardContent>
          </CardActionArea>
        </NextLink>
        <CardActions sx={{ px: 3, pb: 3 }}>
          <JourneyCardInfo journey={journey} variant={variant} />
          <JourneyCardMenu
            id={journey.id}
            status={journey.status}
            slug={journey.slug}
            published={journey.publishedAt != null}
            refetch={refetch}
          />
        </CardActions>
      </>
    </Card>
  )
}
