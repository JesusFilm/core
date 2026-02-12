import { ApolloQueryResult } from '@apollo/client'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useRef, useState } from 'react'

import { isJourneyCustomizable } from '@core/journeys/ui/isJourneyCustomizable'
import { JourneyFields } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'
import { useNavigationState } from '@core/journeys/ui/useNavigationState'
import BarGroup3Icon from '@core/shared/ui/icons/BarGroup3'
import Globe from '@core/shared/ui/icons/Globe'
import Lightning2 from '@core/shared/ui/icons/Lightning2'

import {
  GetAdminJourneys,
  GetAdminJourneys_journeys as Journey
} from '../../../../__generated__/GetAdminJourneys'
import logoGray from '../../../../public/logo-grayscale.svg'

import { JourneyCardInfo } from './JourneyCardInfo'
import { JourneyCardMenu } from './JourneyCardMenu'
import { JourneyCardText } from './JourneyCardText'
import { JourneyCardVariant } from './journeyCardVariant'
import { TemplateAggregateAnalytics } from './TemplateAggregateAnalytics'

const TemplateBreakdownAnalyticsDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "TemplateBreakdownAnalyticsDialog" */
      '../../TemplateBreakdownAnalyticsDialog/TemplateBreakdownAnalyticsDialog'
    ).then((mod) => mod.TemplateBreakdownAnalyticsDialog),
  { ssr: false }
)

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
  const [breakdownDialogOpen, setBreakdownDialogOpen] = useState(false)
  const [hasOpenDialog, setHasOpenDialog] = useState(false)

  const isTemplateCard =
    journey.template === true && journey.team?.id !== 'jfp-team'

  useEffect(() => {
    if (duplicatedJourneyId != null && duplicatedJourneyRef.current != null) {
      duplicatedJourneyRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, [duplicatedJourneyId, journey])

  const updateHoverState = (hovered: boolean) => {
    if (!hasOpenDialog) {
      setIsCardHovered(hovered)
    }
  }

  useEffect(() => {
    console.log('isCardHovered', isCardHovered)
    console.log('hasOpenDialog', hasOpenDialog)
  }, [hasOpenDialog, isCardHovered])

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
        boxShadow: isCardHovered ? 2 : 0
      }}
      data-testid={`JourneyCard-${journey.id}`}
      onMouseEnter={() => updateHoverState(true)}
      onMouseLeave={() => updateHoverState(false)}
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
            onMenuClose={() => updateHoverState(false)}
            template={journey.template ?? false}
            setHasOpenDialog={setHasOpenDialog}
          />
        </Box>
        <CardActionArea
          component={NextLink}
          prefetch={false}
          href={`/journeys/${journey.id}`}
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
            <Stack
              direction="column"
              spacing={1.5}
              alignItems="flex-start"
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                zIndex: 2
              }}
            >
              {journey.template &&
                isJourneyCustomizable(journey as unknown as JourneyFields) && (
                  <Box
                    data-testid="JourneyCardQuickStartBadge"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: '#000000cc',
                      borderRadius: 11,
                      padding: 1,
                      paddingRight: isCardHovered ? 3 : 1,
                      transition: 'padding 0.3s ease',
                      boxShadow: `0 3px 4px 0 #0000004D`
                    }}
                  >
                    <Box
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Lightning2 sx={{ fontSize: 18, color: '#FFD700' }} />
                    </Box>
                    <Typography
                      sx={{
                        ml: isCardHovered ? 1 : 0,
                        maxWidth: isCardHovered ? 100 : 0,
                        opacity: isCardHovered ? 1 : 0,
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.3s ease',
                        color: '#FFD700',
                        typography: 'overline2'
                      }}
                    >
                      {t('Quick Start')}
                    </Typography>
                  </Box>
                )}
              {journey.website && (
                <Box
                  data-testid="JourneyCardWebsiteBadge"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#000000cc',
                    borderRadius: 11,
                    padding: 1,
                    paddingRight: isCardHovered ? 3 : 1,
                    transition: 'padding 0.3s ease',
                    boxShadow: `0 3px 4px 0 #0000004D`
                  }}
                >
                  <Box
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Globe sx={{ fontSize: 18, color: '#4DA3FF' }} />
                  </Box>
                  <Typography
                    sx={{
                      ml: isCardHovered ? 1 : 0,
                      maxWidth: isCardHovered ? 100 : 0,
                      opacity: isCardHovered ? 1 : 0,
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.3s ease',
                      color: '#4DA3FF',
                      typography: 'overline2'
                    }}
                  >
                    {t('Website')}
                  </Typography>
                </Box>
              )}
            </Stack>
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
                alt={t('No Image')}
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
              data-testid="JourneyCardOverlayBox"
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
        <Box
          sx={{
            position: 'absolute',
            bottom: { xs: 8, sm: 4 },
            left: { xs: 7, sm: 6 },
            right: 9,
            zIndex: 3
          }}
        >
          {isTemplateCard ? (
            <Stack
              direction="row"
              gap={1}
              justifyContent="space-between"
              alignItems="center"
              sx={{
                pb: 1
              }}
            >
              <TemplateAggregateAnalytics journeyId={journey.id} />
              <IconButton
                size="small"
                aria-label="journey breakdown analytics"
                sx={{
                  outline: '2px solid',
                  outlineColor: 'secondary.light',
                  borderRadius: '6px',
                  padding: 1
                }}
                onClick={() => setBreakdownDialogOpen(true)}
              >
                <BarGroup3Icon fontSize="small" />
              </IconButton>
            </Stack>
          ) : (
            <JourneyCardInfo journey={journey} variant={variant} />
          )}
        </Box>
        <TemplateBreakdownAnalyticsDialog
          journeyId={journey.id}
          open={breakdownDialogOpen}
          handleClose={() => setBreakdownDialogOpen(false)}
        />
      </>
    </Card>
  )
}
