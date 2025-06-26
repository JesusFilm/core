import { ApolloQueryResult } from '@apollo/client'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import { useTheme } from '@mui/material/styles'
import Image from 'next/image'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useRef, useState } from 'react'

import { useNavigationState } from '@core/journeys/ui/useNavigationState'

import {
  GetAdminJourneys,
  GetAdminJourneys_journeys as Journey
} from '../../../../__generated__/GetAdminJourneys'
import logoGray from '../../../../public/logo-grayscale.svg'

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
  const [isCardHovered, setIsCardHovered] = useState(false)
  const [isImageLoading, setIsImageLoading] = useState(true)

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
        borderColor: 'divider',
        borderBottom: 'none',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        '&:last-of-type': {
          borderBottomLeftRadius: '12px',
          borderBottomRightRadius: '12px',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
          borderBottom: '1px solid',
          borderColor: 'divider'
        },
        height: '100%',
        boxShadow: isCardHovered ? 2 : 0
      }}
      data-testid={`JourneyCard-${journey.id}`}
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
    >
      <>
        <Box
          data-testid="JourneyCardMenuBox"
          sx={{
            position: 'absolute',
            top: { xs: 10, sm: 12 },
            right: { xs: 8, sm: 13 },
            zIndex: 3
          }}
        >
          <JourneyCardMenu
            id={journey.id}
            status={journey.status}
            slug={journey.slug}
            published={journey.publishedAt != null}
            refetch={refetch}
            journey={journey}
            hovered={isCardHovered}
            onMenuClose={() => setIsCardHovered(false)}
            template={journey.template ?? false}
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
              opacity: isNavigating ? 0.5 : 1,
              flex: 1
            }}
          >
            {variant === JourneyCardVariant.new && (
              <Box
                sx={{
                  position: 'absolute',
                  top: { xs: 16, sm: 12 },
                  left: { xs: 20, sm: 15 },
                  zIndex: 1
                }}
              >
                <Chip
                  label={t('New')}
                  size="small"
                  data-testid="new-journey-badge"
                  sx={{
                    fontSize: 10,
                    backgroundColor: 'warning.main',
                    color: 'warning.contrastText',
                    borderRadius: 11,
                    height: 22,
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
                aspectRatio: {
                  xs: '2',
                  sm: '1.43'
                },
                mx: { xs: 3, sm: 1.75 },
                mt: { xs: 3, sm: 1.75 },
                borderRadius: '8px',
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: 'rgba(0, 0, 0, 0.02)',
                bgcolor: 'rgba(0, 0, 0, 0.06)',
                overflow: 'hidden'
              }}
            >
              {journey.primaryImageBlock?.src != null ? (
                <>
                  {isImageLoading && (
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height="100%"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '100%',
                        width: '100%'
                      }}
                    />
                  )}
                  <Image
                    data-testid="JourneyCardImage"
                    src={journey.primaryImageBlock.src}
                    alt={journey.primaryImageBlock.alt ?? ''}
                    fill
                    style={{
                      objectFit: 'cover'
                    }}
                    sizes={`
                      (max-width: ${theme.breakpoints.values.sm}px) calc(100vw - ${theme.spacing(6)})px,
                      (max-width: ${theme.breakpoints.values.md}px) calc(40vw - ${theme.spacing(6)})px,
                      calc(20vw - ${theme.spacing(6)})px
                    `}
                    onLoadingComplete={() => setIsImageLoading(false)}
                  />
                </>
              ) : (
                <Image
                  data-testid="JourneyCardNoImage"
                  src={logoGray}
                  alt="No Image"
                  width={50}
                  height={50}
                  style={{
                    objectFit: 'contain',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              )}
              <Box
                aria-hidden
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  bgcolor: 'rgba(0,0,0,0.3)',
                  opacity: isCardHovered ? 1 : 0,
                  transition: 'opacity 0.3s'
                }}
              />
            </Box>
            <CardContent
              sx={{
                pl: { xs: 3, sm: 2.5 },
                pr: 2,
                pt: 1,
                height: { xs: 139, sm: 137 }, // Fixed height to accommodate both one and two line titles
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start'
              }}
            >
              <JourneyCardText journey={journey} />
            </CardContent>
          </CardActionArea>
        </NextLink>
        <Box
          sx={{
            position: 'absolute',
            bottom: { xs: 8, sm: 3 },
            left: { xs: 7, sm: 6 },
            right: { xs: 10, sm: 7 },
            zIndex: 3
          }}
        >
          <JourneyCardInfo journey={journey} variant={variant} />
        </Box>
      </>
    </Card>
  )
}
