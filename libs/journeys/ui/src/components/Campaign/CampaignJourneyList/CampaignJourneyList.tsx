import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import {
  CampaignJourneyListDisplay,
  CampaignStringKey,
  JourneyStatus
} from '../../../../__generated__/globalTypes'
import { useCampaign } from '../CampaignProvider'
import { campaignString } from '../CampaignRegionShare'
import { CampaignSectionBand } from '../CampaignSectionBand'
import { CampaignSectionHeading } from '../CampaignSectionHeading'
import { hasText } from '../types'
import type { CampaignBlockOf, CampaignTreeOf } from '../types'

interface CampaignJourneyListProps {
  block: CampaignTreeOf<'CampaignJourneyListBlock'>
}

export type CampaignJourneyCard = CampaignBlockOf<'CampaignJourneyBlock'>

/**
 * The cards a journey list shows: its CampaignJourneyBlock items, in order,
 * only while the journey behind each is live-published with an address. An
 * unpublished or deleted journey is omitted, with no placeholder.
 */
export function liveJourneyCards(
  block: Pick<CampaignTreeOf<'CampaignJourneyListBlock'>, 'children'>
): CampaignJourneyCard[] {
  return block.children
    .filter(
      (child): child is CampaignJourneyCard & typeof child =>
        child.__typename === 'CampaignJourneyBlock' &&
        child.journeyStatus === JourneyStatus.published &&
        child.journeyUrl != null
    )
    .sort((a, b) => (a.parentOrder ?? 0) - (b.parentOrder ?? 0))
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
  const list = display === CampaignJourneyListDisplay.list
  return (
    <Stack
      data-testid={`CampaignJourneyCard-${card.id}`}
      sx={{
        flexDirection: list ? { xs: 'column', md: 'row' } : 'column',
        overflow: 'hidden',
        borderRadius: 1,
        backgroundColor: 'var(--campaign-band-card)',
        border: '1px solid var(--campaign-band-border)'
      }}
    >
      {card.journeyImage != null && (
        <Box
          component="img"
          src={card.journeyImage.src}
          alt={card.journeyImage.alt ?? ''}
          loading="lazy"
          data-testid="CampaignJourneyCardImage"
          sx={{
            display: 'block',
            width: list ? { xs: '100%', md: 240 } : '100%',
            flexShrink: 0,
            aspectRatio: '16 / 9',
            objectFit: 'cover'
          }}
        />
      )}
      <Stack spacing={1} sx={{ p: 3, flexGrow: 1, alignItems: 'flex-start' }}>
        {hasText(card.title) && (
          <Typography
            variant="h5"
            component="h3"
            data-testid="CampaignJourneyCardTitle"
            sx={{ color: 'var(--campaign-band-heading)' }}
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
        <Button
          href={card.journeyUrl ?? undefined}
          variant="contained"
          size="small"
          data-testid="CampaignJourneyCardOpen"
          sx={{
            mt: 1,
            backgroundColor: 'var(--campaign-band-button)',
            color: 'var(--campaign-band-button-label)',
            '&:hover': {
              backgroundColor: 'var(--campaign-band-button)',
              filter: 'brightness(0.92)'
            }
          }}
        >
          {openLabel}
        </Button>
      </Stack>
    </Stack>
  )
}

/**
 * The Journey List: its heading, then a card for each live-published journey
 * as a grid or a list (`display`), one column below `md`. Each card carries
 * the journey's snapshot title and description, its primary image read live,
 * and an "Open journey" button (the campaign's `openTemplate` string) to the
 * journey's own public address.
 */
export function CampaignJourneyList({
  block
}: CampaignJourneyListProps): ReactElement {
  const { campaign } = useCampaign()
  const cards = liveJourneyCards(block)
  const display = block.display ?? CampaignJourneyListDisplay.grid
  const openLabel = campaignString(campaign, CampaignStringKey.openTemplate)

  return (
    <CampaignSectionBand block={block}>
      <CampaignSectionHeading
        eyebrow={block.eyebrow}
        title={block.title}
        lede={block.lede}
      />
      {cards.length > 0 && (
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
          {cards.map((card) => (
            <JourneyCard
              key={card.id}
              card={card}
              display={display}
              openLabel={openLabel}
            />
          ))}
        </Box>
      )}
    </CampaignSectionBand>
  )
}
