import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { SxProps, Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, ReactNode } from 'react'

import {
  CampaignJourneyListDisplay,
  CampaignStringKey,
  JourneyStatus
} from '../../../../__generated__/globalTypes'
import { bandButtonSx } from '../CampaignButton'
import { useCampaign } from '../CampaignProvider'
import { CampaignSectionBand } from '../CampaignSectionBand'
import { CampaignSectionHeading } from '../CampaignSectionHeading'
import { isHttpsUrl } from '../libs/isHttpsUrl'
import { hasText } from '../types'
import type { CampaignBlockOf, CampaignTreeOf } from '../types'

/** A plain style object: it spreads into another `sx`, unlike the array and function forms of `SxProps`. */
type StyleObject = Exclude<
  SxProps<Theme>,
  ReadonlyArray<unknown> | ((theme: Theme) => unknown)
>

interface CampaignJourneyListProps {
  block: CampaignTreeOf<'CampaignJourneyListBlock'>
}

export type CampaignJourneyCard = CampaignBlockOf<'CampaignJourneyBlock'>

/** Whether visitors can reach a journey with this live status: published or archived. */
export function isJourneyCardVisible(
  status: JourneyStatus | null | undefined
): boolean {
  return status === JourneyStatus.published || status === JourneyStatus.archived
}

/**
 * The cards a journey list shows: its CampaignJourneyBlock items, in order,
 * only while the journey behind each is published or archived with an
 * address. A draft, trashed or deleted journey is omitted, with no placeholder.
 */
export function liveJourneyCards(
  block: Pick<CampaignTreeOf<'CampaignJourneyListBlock'>, 'children'>
): CampaignJourneyCard[] {
  return block.children
    .filter(
      (child): child is CampaignJourneyCard & typeof child =>
        child.__typename === 'CampaignJourneyBlock' &&
        isJourneyCardVisible(child.journeyStatus) &&
        child.journeyUrl != null
    )
    .sort((a, b) => (a.parentOrder ?? 0) - (b.parentOrder ?? 0))
}

/** One card's frame, for the list's `display`: a column, or an image beside the text from `md`. */
export function journeyCardFrameSx(
  display: CampaignJourneyListDisplay
): StyleObject {
  return {
    flexDirection:
      display === CampaignJourneyListDisplay.list
        ? { xs: 'column', md: 'row' }
        : 'column',
    overflow: 'hidden',
    borderRadius: 1,
    backgroundColor: 'var(--campaign-band-card)',
    border: '1px solid var(--campaign-band-border)'
  }
}

/** A card's image, for the list's `display`. */
export function journeyCardImageSx(
  display: CampaignJourneyListDisplay
): StyleObject {
  return {
    display: 'block',
    width:
      display === CampaignJourneyListDisplay.list
        ? { xs: '100%', md: 240 }
        : '100%',
    flexShrink: 0,
    aspectRatio: '16 / 9',
    objectFit: 'cover'
  }
}

interface CampaignJourneyCardsProps {
  display: CampaignJourneyListDisplay
  children: ReactNode
}

/** The container of a list's cards: a grid that fills at 260 px, or one full-width row each. */
export function CampaignJourneyCards({
  display,
  children
}: CampaignJourneyCardsProps): ReactElement {
  return (
    <Box
      data-testid="CampaignJourneyCards"
      data-display={display}
      sx={
        display === CampaignJourneyListDisplay.list
          ? { display: 'flex', flexDirection: 'column', gap: 2 }
          : {
              display: 'grid',
              gap: 2,
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(auto-fill, minmax(260px, 1fr))'
              }
            }
      }
    >
      {children}
    </Box>
  )
}

interface CampaignJourneyOpenButtonProps {
  label: string
  /** The journey's address; without one the button is a read-only preview. */
  href?: string
}

/**
 * A card's "Open journey" button; the canvas shows it without an address. A
 * blank label stays blank but keeps "Open" as the accessible name.
 */
export function CampaignJourneyOpenButton({
  label,
  href
}: CampaignJourneyOpenButtonProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  return (
    <Button
      {...(href == null
        ? { component: 'div', tabIndex: -1, disableRipple: true }
        : { href })}
      aria-label={hasText(label) ? undefined : t('Open')}
      variant="contained"
      size="small"
      data-testid="CampaignJourneyCardOpen"
      sx={{ ...bandButtonSx, mt: 1, whiteSpace: 'pre-line' }}
    >
      {label}
    </Button>
  )
}

interface JourneyCardProps {
  card: CampaignJourneyCard
  display: CampaignJourneyListDisplay
  openLabel: string
}

function JourneyCard({
  card,
  display,
  openLabel
}: JourneyCardProps): ReactElement {
  return (
    <Stack
      data-testid={`CampaignJourneyCard-${card.id}`}
      sx={journeyCardFrameSx(display)}
    >
      {card.journeyImage != null && isHttpsUrl(card.journeyImage.src) && (
        <Box
          component="img"
          src={card.journeyImage.src}
          alt={card.journeyImage.alt ?? ''}
          loading="lazy"
          data-testid="CampaignJourneyCardImage"
          sx={journeyCardImageSx(display)}
        />
      )}
      <Stack spacing={1} sx={{ p: 3, flexGrow: 1, alignItems: 'flex-start' }}>
        {hasText(card.title) && (
          <Typography
            variant="h5"
            component="h3"
            data-testid="CampaignJourneyCardTitle"
            sx={{
              color: 'var(--campaign-band-heading)',
              whiteSpace: 'pre-line'
            }}
          >
            {card.title}
          </Typography>
        )}
        {hasText(card.description) && (
          <Typography
            variant="body2"
            data-testid="CampaignJourneyCardDescription"
            sx={{ color: 'var(--campaign-band-muted)', whiteSpace: 'pre-line' }}
          >
            {card.description}
          </Typography>
        )}
        <Box sx={{ flexGrow: 1 }} />
        <CampaignJourneyOpenButton
          label={openLabel}
          href={card.journeyUrl ?? undefined}
        />
      </Stack>
    </Stack>
  )
}

/**
 * The Journey List: its heading, then a card for each live-published journey
 * as a grid or a list (`display`), one column below `md`. Each card carries
 * the journey's snapshot title and description, its primary image read live
 * (only an https one), and an "Open journey" button (the campaign's
 * `openTemplate` string) to the journey's own public address. With no live
 * card it shows the campaign's `noJourneys` string under the heading instead.
 */
export function CampaignJourneyList({
  block
}: CampaignJourneyListProps): ReactElement {
  const { string } = useCampaign()
  const cards = liveJourneyCards(block)
  const display = block.display ?? CampaignJourneyListDisplay.grid
  const openLabel = string(CampaignStringKey.openTemplate)
  const noJourneysLabel = string(CampaignStringKey.noJourneys)

  return (
    <CampaignSectionBand block={block}>
      <CampaignSectionHeading
        eyebrow={block.eyebrow}
        title={block.title}
        description={block.description}
      />
      {cards.length === 0 && hasText(noJourneysLabel) && (
        <Typography
          variant="body1"
          data-testid="CampaignJourneyListEmpty"
          sx={{ color: 'var(--campaign-band-muted)', whiteSpace: 'pre-line' }}
        >
          {noJourneysLabel}
        </Typography>
      )}
      {cards.length > 0 && (
        <CampaignJourneyCards display={display}>
          {cards.map((card) => (
            <JourneyCard
              key={card.id}
              card={card}
              display={display}
              openLabel={openLabel}
            />
          ))}
        </CampaignJourneyCards>
      )}
    </CampaignSectionBand>
  )
}
