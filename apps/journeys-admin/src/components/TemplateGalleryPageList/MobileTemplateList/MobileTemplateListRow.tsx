import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useState } from 'react'

import { useNavigationState } from '@core/journeys/ui/useNavigationState'
import DragIcon from '@core/shared/ui/icons/Drag'
import Globe from '@core/shared/ui/icons/Globe'
import Lightning2 from '@core/shared/ui/icons/Lightning2'
import TranslateIcon from '@core/shared/ui/icons/Translate'

import { GetAdminJourneys_journeys as Journey } from '../../../../__generated__/GetAdminJourneys'
import logoGray from '../../../../public/logo-grayscale.svg'
import { JourneyCardMenu } from '../../JourneyList/JourneyCard/JourneyCardMenu'

import { TemplateRowMetrics } from './TemplateRowMetrics'
import { ThumbBadge } from './ThumbBadge'

const TemplateBreakdownAnalyticsDialog = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "TemplateBreakdownAnalyticsDialog" */
      '../../TemplateBreakdownAnalyticsDialog/TemplateBreakdownAnalyticsDialog'
    ).then((mod) => mod.TemplateBreakdownAnalyticsDialog),
  { ssr: false }
)

export interface MobileTemplateListRowProps {
  journey: Journey
  /**
   * Optional drag handle slot — the parent (MobileTemplateList) renders
   * a useSortable-bound handle here in Step 5. Until then the row shows
   * the visual handle without listeners.
   */
  dragHandleSlot?: ReactElement
  /** Suppress the default visual handle (used when dragHandleSlot is set). */
  hideDefaultDragHandle?: boolean
}

const ROW_THUMB_WIDTH = 80
const ROW_THUMB_HEIGHT = 60
const DRAG_HANDLE_WIDTH = 44

/**
 * Single-row representation of a template for the mobile gallery view.
 * Layout: thumbnail (with Quick Start / Website corner badges) on the
 * left, title + meta (language + Template uses + 3-dot menu) in the
 * middle, full-height drag handle on the right.
 *
 * The body is wrapped in a NextLink-backed CardActionArea so tapping the
 * row navigates to the journey. The menu and drag handle sit outside the
 * CardActionArea so taps on them do not trigger navigation.
 */
export function MobileTemplateListRow({
  journey,
  dragHandleSlot,
  hideDefaultDragHandle = false
}: MobileTemplateListRowProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const isNavigating = useNavigationState()
  const [breakdownDialogOpen, setBreakdownDialogOpen] = useState(false)
  const [hasMenuDialogOpen, setHasMenuDialogOpen] = useState(false)

  const isTemplateCard =
    journey.template === true && journey.team?.id !== 'jfp-team'

  const languageName = journey?.language?.name.find(
    ({ primary }) =>
      primary || journey.language.name.some(({ primary }) => !primary)
  )?.value

  function handleOpenAnalytics(): void {
    setBreakdownDialogOpen(true)
  }
  function handleCloseAnalytics(): void {
    setBreakdownDialogOpen(false)
    setHasMenuDialogOpen(false)
  }

  return (
    <Card
      data-testid={`MobileTemplateListRow-${journey.id}`}
      variant="outlined"
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'stretch',
        // The list container (MobileTemplateList) owns the outer border and the
        // between-row dividers, so each row is borderless and square to read as
        // one continuous list rather than a stack of separate cards.
        border: 0,
        borderRadius: 0
      }}
    >
      <CardActionArea
        component={NextLink}
        prefetch={false}
        href={`/journeys/${journey.id}`}
        disabled={isNavigating}
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          alignItems: 'stretch',
          opacity: isNavigating ? 0.5 : 1
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: ROW_THUMB_WIDTH,
            height: ROW_THUMB_HEIGHT,
            m: 1,
            flexShrink: 0,
            borderRadius: 1,
            overflow: 'hidden',
            bgcolor: 'rgba(0, 0, 0, 0.06)'
          }}
        >
          {journey.primaryImageBlock?.src != null ? (
            <Image
              data-testid="MobileTemplateListRowImage"
              src={journey.primaryImageBlock.src}
              alt={journey.primaryImageBlock.alt ?? ''}
              fill
              sizes={`${ROW_THUMB_WIDTH}px`}
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <Image
              data-testid="MobileTemplateListRowNoImage"
              src={logoGray}
              alt={t('No Image')}
              width={36}
              height={36}
              style={{
                objectFit: 'contain',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            />
          )}
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              position: 'absolute',
              top: 4,
              left: 4
            }}
          >
            {journey.customizable === true && (
              <ThumbBadge
                label={t('Quick Start')}
                background="#000000cc"
                icon={<Lightning2 sx={{ fontSize: 12, color: '#FFD700' }} />}
              />
            )}
            {journey.website === true && (
              <ThumbBadge
                label={t('Website')}
                background="#000000cc"
                icon={<Globe sx={{ fontSize: 12, color: '#4DA3FF' }} />}
              />
            )}
          </Stack>
        </Box>

        <Stack
          sx={{
            flex: 1,
            minWidth: 0,
            // Reserve space at the bottom-right for the absolutely-positioned
            // menu button so the meta row doesn't overlap with it.
            py: 1,
            pl: 0.5,
            pr: 1,
            justifyContent: 'space-between'
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              color: 'secondary.main',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              wordBreak: 'break-word'
            }}
          >
            {journey.title}
          </Typography>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              mt: 0.5,
              minHeight: 20,
              // Wrap to a second line on narrow screens rather than crowding
              // language + the three metrics onto one line.
              flexWrap: 'wrap',
              rowGap: 0.5,
              // Reserve the bottom-right corner for the absolutely-positioned
              // 3-dot menu so wrapped meta content doesn't run under it.
              pr: '40px'
            }}
          >
            {languageName != null && (
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.5}
                sx={{ minWidth: 0 }}
              >
                <TranslateIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  noWrap
                  sx={{ maxWidth: 90 }}
                >
                  {languageName}
                </Typography>
              </Stack>
            )}
            {isTemplateCard && (
              <>
                {languageName != null && (
                  <Typography variant="caption" color="text.secondary">
                    ·
                  </Typography>
                )}
                <TemplateRowMetrics journeyId={journey.id} />
              </>
            )}
          </Stack>
        </Stack>
      </CardActionArea>

      {/* Menu column — sits OUTSIDE the CardActionArea so taps on the menu
          don't trigger navigation. Sized to match the drag handle column and
          centered vertically; sits at flex-end, just before the drag handle. */}
      <Box
        data-testid="MobileTemplateListRowMenuColumn"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <JourneyCardMenu
          id={journey.id}
          status={journey.status}
          slug={journey.slug}
          published={journey.publishedAt != null}
          journey={journey}
          template={journey.template ?? false}
          variant="plain"
          onAnalyticsRequest={isTemplateCard ? handleOpenAnalytics : undefined}
          setHasOpenDialog={setHasMenuDialogOpen}
        />
      </Box>

      {/* Drag handle column — full height on the far right. Step 5 binds
          dnd-kit listeners to the handle via dragHandleSlot. */}
      <Box
        data-testid="MobileTemplateListRowDragHandleColumn"
        sx={{
          width: DRAG_HANDLE_WIDTH,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          borderLeft: 1,
          borderColor: 'divider',
          color: 'text.secondary'
        }}
      >
        {dragHandleSlot ?? (hideDefaultDragHandle ? null : <DragIcon />)}
      </Box>

      <TemplateBreakdownAnalyticsDialog
        journeyId={journey.id}
        open={breakdownDialogOpen}
        handleClose={handleCloseAnalytics}
      />
    </Card>
  )
}
