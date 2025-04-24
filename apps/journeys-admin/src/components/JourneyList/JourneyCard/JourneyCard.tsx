import { ApolloQueryResult } from '@apollo/client'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import { useTheme } from '@mui/material/styles'
import Image from 'next/image'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
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
  const theme = useTheme()
  const duplicatedJourneyRef = useRef<HTMLDivElement>(null)
  const isNavigating = useNavigationState()
  const { t } = useTranslation('apps-journeys-admin')

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
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        '&:last-of-type': {
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          borderBottom: '1px solid',
          borderColor: 'divider'
        },
        height: '100%'
      }}
      data-testid={`JourneyCard-${journey.id}`}
    >
      <>
        <Box sx={{ position: 'absolute', top: 12, right: 18, zIndex: 1 }}>
          <JourneyCardMenu
            id={journey.id}
            status={journey.status}
            slug={journey.slug}
            published={journey.publishedAt != null}
            refetch={refetch}
          />
        </Box>
        <NextLink
          href={`/journeys/${journey.id}`}
          passHref
          legacyBehavior
          prefetch={false}
        >
          <CardActionArea
            disabled={isNavigating}
            sx={{
              borderRadius: 0,
              opacity: isNavigating ? 0.5 : 1,
              flex: 1
            }}
          >
            {variant === JourneyCardVariant.new && (
              <Box sx={{ position: 'absolute', top: 20, left: 20, zIndex: 1 }}>
                <Chip
                  label={t('New')}
                  size="small"
                  data-testid="new-journey-badge"
                  sx={{
                    backgroundColor: 'warning.main',
                    color: 'warning.contrastText',
                    borderRadius: 12.5,
                    height: 25,
                    px: 0.5,
                    border: 1.5,
                    borderColor: '#eb5b3b'
                  }}
                />
              </Box>
            )}
            <Box
              sx={{
                position: 'relative',
                width: 'auto',
                paddingTop: {
                  xs: `${(1 / 2) * 100}%`,
                  sm: `${(4 / 6) * 100}%`
                },
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
                  // Define appropriate image sizes for different screen sizes
                  sizes={`
                    (max-width: ${theme.breakpoints.values.sm}px) calc(100vw - ${theme.spacing(6)})px,
                    (max-width: ${theme.breakpoints.values.md}px) calc(40vw - ${theme.spacing(6)})px,
                    calc(20vw - ${theme.spacing(6)})px
                  `}
                />
              )}
            </Box>
            <CardContent sx={{ px: 3, py: 3 }}>
              <JourneyCardText journey={journey} />
            </CardContent>
          </CardActionArea>
        </NextLink>
        <CardActions sx={{ pr: 3, pb: 2 }}>
          <JourneyCardInfo journey={journey} variant={variant} />
        </CardActions>
      </>
    </Card>
  )
}
