import { ApolloQueryResult } from '@apollo/client'
import OpenWithRoundedIcon from '@mui/icons-material/OpenWithRounded'
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
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useEffect, useRef, useState } from 'react'

import { useNavigationState } from '@core/journeys/ui/useNavigationState'
import BarGroup3Icon from '@core/shared/ui/icons/BarGroup3'
import Globe from '@core/shared/ui/icons/Globe'
import Lightning2 from '@core/shared/ui/icons/Lightning2'

import {
  GetAdminJourneys,
  GetAdminJourneys_journeys as Journey
} from '../../../../__generated__/GetAdminJourneys'
import logoGray from '../../../../public/logo-grayscale.svg'
import { useGalleryDialogLock } from '../../TemplateGalleryPageList/GalleryDialogLockContext'

import { JourneyCardInfo } from './JourneyCardInfo'
import { JourneyCardMenu } from './JourneyCardMenu'
import { JourneyCardText } from './JourneyCardText'
import { JourneyCardVariant } from './journeyCardVariant'
import { TemplateAggregateAnalytics } from './TemplateAggregateAnalytics'

// Shared between the card's own layout and JourneyCardSizer below.
const JOURNEY_CARD_IMAGE_MARGIN = { xs: 3, sm: 1.75 }
const JOURNEY_CARD_IMAGE_ASPECT_RATIO = { xs: '2', sm: '1.43' }
// Fixed text-block height accommodating one- and two-line titles.
const JOURNEY_CARD_CONTENT_HEIGHT = { xs: 139, sm: 137 }

/**
 * Invisible spacer matching a JourneyCard's in-flow height (NES-1703).
 * The template gallery's DropPlaceholderTile renders this so its dashed
 * tile is always exactly card-sized — even alone in an empty collection.
 *
 * Colocated with JourneyCard because the height contract is structural,
 * not just these constants: it also relies on the analytics/info footer
 * being `position: absolute` and the Card adding no in-flow chrome. If
 * you add in-flow content to JourneyCard, mirror it here.
 */
export function JourneyCardSizer(): ReactElement {
  return (
    <>
      <Box
        aria-hidden
        sx={{
          mx: JOURNEY_CARD_IMAGE_MARGIN,
          mt: JOURNEY_CARD_IMAGE_MARGIN,
          aspectRatio: JOURNEY_CARD_IMAGE_ASPECT_RATIO
        }}
      />
      <Box aria-hidden sx={{ height: JOURNEY_CARD_CONTENT_HEIGHT }} />
    </>
  )
}

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
  /**
   * NES-1703: renders a multi-directional move arrow over the centre of
   * the image, signalling the card can be dragged. `'hover'` fades it in
   * on hover (resting gallery cards); `'always'` keeps it visible (the
   * DragOverlay clone, where dnd-kit's pointer capture means hover state
   * never fires). Only the template-gallery drag wrappers pass this —
   * the plain journey lists render no affordance.
   */
  showDragAffordance?: 'hover' | 'always'
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
 * @param {'hover' | 'always'} [props.showDragAffordance] - Renders the move-arrow drag affordance over the image (NES-1703)
 * @returns {ReactElement} A journey card component
 */

export function JourneyCard({
  journey,
  duplicatedJourneyId,
  variant = JourneyCardVariant.default,
  refetch,
  showDragAffordance
}: JourneyCardProps): ReactElement {
  const theme = useTheme()
  const duplicatedJourneyRef = useRef<HTMLDivElement>(null)
  const isNavigating = useNavigationState()
  const { t } = useTranslation('apps-journeys-admin')
  const [isCardHovered, setIsCardHovered] = useState(false)
  const [isImageLoading, setIsImageLoading] = useState(true)
  const [breakdownDialogOpen, setBreakdownDialogOpen] = useState(false)
  const [hasOpenDialog, setHasOpenDialog] = useState(false)

  // NES-1666 v2: when this card lives inside the LTL gallery, notify the
  // gallery's drag context whenever any of our portaled dialogs (menu
  // dialogs + breakdown analytics) toggles. The gallery uses the
  // aggregated signal to mark the DnD subtree `inert`, blocking dnd-kit's
  // document-level sensors from firing while a dialog is on screen. The
  // hook returns `null` outside the gallery, so this effect is a no-op
  // for ActiveJourneyList / ArchivedJourneyList / TrashedJourneyList /
  // TemplateList consumers.
  const galleryDialogLock = useGalleryDialogLock()
  const anyDialogOpen = hasOpenDialog || breakdownDialogOpen
  useEffect(() => {
    galleryDialogLock?.onDialogOpenChange(journey.id, anyDialogOpen)
  }, [anyDialogOpen, galleryDialogLock, journey.id])
  useEffect(() => {
    // Clear the gallery lock entry when the card unmounts mid-dialog —
    // otherwise the gallery would stay locked forever if e.g. a team
    // switch refetched the gallery list while a menu dialog was open.
    return () => {
      galleryDialogLock?.onDialogOpenChange(journey.id, false)
    }
  }, [galleryDialogLock, journey.id])

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
              aspectRatio: JOURNEY_CARD_IMAGE_ASPECT_RATIO,
              mx: JOURNEY_CARD_IMAGE_MARGIN,
              mt: JOURNEY_CARD_IMAGE_MARGIN,
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
              {journey.customizable === true && (
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
            {showDragAffordance != null && (
              <Box
                data-testid="JourneyCardDragAffordance"
                aria-hidden
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: '#000000cc',
                  color: 'common.white',
                  opacity:
                    showDragAffordance === 'always' || isCardHovered ? 1 : 0,
                  transition: 'opacity 0.3s',
                  // Purely visual — never intercept the pointer, or it
                  // would swallow the drag sensor's pointerdown.
                  pointerEvents: 'none'
                }}
              >
                <OpenWithRoundedIcon />
              </Box>
            )}
          </Box>
          <CardContent
            sx={{
              pl: { xs: 3, sm: 2.5 },
              pr: 2,
              pt: 1,
              height: JOURNEY_CARD_CONTENT_HEIGHT,
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
