import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import { SimplePaletteColorOptions } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { MouseEvent, ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import type { CampaignTreeBlock } from '@core/journeys/ui/Campaign'
import { adminTheme } from '@core/shared/ui/themes/journeysAdmin/theme'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../__generated__/GetCampaign'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { CampaignTextField } from '../../../libs/useCampaignBlockTextMutation'
import { useCampaignJourneyBlockCreateMutation } from '../../../libs/useCampaignJourneyBlockCreateMutation'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { InlineText } from '../Canvas/InlineText'
import { JourneyPasteField } from '../Pickers/JourneyPasteField'

const adminPrimary = adminTheme.palette.primary as SimplePaletteColorOptions

const SELECTED_OUTLINE = {
  outline: `2px solid ${adminPrimary.main}`,
  outlineOffset: -2
}

type JourneyCardBlock = Extract<
  CampaignBlock,
  { __typename: 'CampaignJourneyBlock' }
>

interface JourneyListEditProps {
  /** The journey list this editor sits in, with its treed children. */
  block: Pick<CampaignBlock, 'id'> & {
    children: Array<CampaignTreeBlock<CampaignBlock>>
  }
  /** The list, or one of its cards, is the current selection. */
  active: boolean
  /** The card field the bar's Edit asked to focus. */
  focusField?: CampaignTextField
  /** Select a card, naming the field that was clicked. */
  onSelectCard: (cardId: string, field: CampaignTextField) => void
}

/** The list's cards in order, as the editor shows them: unpublished journeys too. */
export function journeyCards(
  children: Array<CampaignTreeBlock<CampaignBlock>>
): JourneyCardBlock[] {
  return children
    .filter(
      (child): child is JourneyCardBlock & (typeof children)[number] =>
        child.__typename === 'CampaignJourneyBlock'
    )
    .sort((a, b) => (a.parentOrder ?? 0) - (b.parentOrder ?? 0))
}

interface JourneyCardEditProps {
  card: JourneyCardBlock
  selected: boolean
  focusField?: CampaignTextField
  onSelect: (field: CampaignTextField) => void
}

/**
 * One journey card on the canvas: the journey's primary image read live, and
 * the snapshot title and description, which edit in place while the card is
 * selected. A card whose journey is no longer published carries a warning;
 * visitors never see it.
 */
function JourneyCardEdit({
  card,
  selected,
  focusField,
  onSelect
}: JourneyCardEditProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const live = card.journeyStatus === JourneyStatus.published

  function handleClick(event: MouseEvent<HTMLElement>): void {
    event.stopPropagation()
    onSelect('title')
  }

  return (
    <Stack
      data-testid={`JourneyCard-${card.id}`}
      data-selected={selected}
      onClick={handleClick}
      sx={{
        overflow: 'hidden',
        borderRadius: 1,
        cursor: 'pointer',
        backgroundColor: 'var(--campaign-band-card)',
        border: '1px solid var(--campaign-band-border)',
        ...(selected ? SELECTED_OUTLINE : {})
      }}
    >
      {card.journeyImage != null && (
        <Box
          component="img"
          src={card.journeyImage.src}
          alt={card.journeyImage.alt ?? ''}
          data-testid="JourneyCardImage"
          sx={{
            display: 'block',
            width: '100%',
            aspectRatio: '16 / 9',
            objectFit: 'cover'
          }}
        />
      )}
      <Stack spacing={1} sx={{ p: 3, alignItems: 'flex-start' }}>
        {!live && (
          <Chip
            size="small"
            color="warning"
            label={
              card.journeyStatus == null
                ? t('Journey deleted')
                : t('Journey unpublished')
            }
            data-testid="JourneyCardUnpublished"
          />
        )}
        <InlineText
          block={card}
          field="title"
          placeholder={t('Journey title')}
          editing={selected}
          autoFocus={selected && focusField === 'title'}
          onSelect={onSelect}
          variant="h5"
          component="h3"
          sx={{ color: 'var(--campaign-band-heading)' }}
        />
        <InlineText
          block={card}
          field="description"
          placeholder={t('Journey description')}
          editing={selected}
          autoFocus={selected && focusField === 'description'}
          onSelect={onSelect}
          variant="body2"
          sx={{ color: 'var(--campaign-band-muted)' }}
        />
      </Stack>
    </Stack>
  )
}

/**
 * The Journey List on the editor canvas: every card, live or not, selectable
 * to edit its title and description in place, and — while the list or one of
 * its cards is selected — the journey paste field that adds another card
 * from an admin link or a public URL. Adding resolves on the server, which
 * snapshots the journey's title and description.
 */
export function JourneyListEdit({
  block,
  active,
  focusField,
  onSelectCard
}: JourneyListEditProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { campaign, selection } = useCampaignEditor()
  const [journeyCreate] = useCampaignJourneyBlockCreateMutation(campaign.id)
  const cards = journeyCards(block.children)
  const selectedId = selection.block?.id

  return (
    <Stack
      spacing={2}
      data-testid="JourneyListEdit"
      sx={{ width: '100%', alignItems: 'stretch' }}
    >
      {cards.length > 0 && (
        <Box
          data-testid="JourneyListCards"
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))'
          }}
        >
          {cards.map((card) => (
            <JourneyCardEdit
              key={card.id}
              card={card}
              selected={selectedId === card.id}
              focusField={focusField}
              onSelect={(field) => onSelectCard(card.id, field)}
            />
          ))}
        </Box>
      )}
      {active ? (
        <Box sx={{ maxWidth: 720 }}>
          <JourneyPasteField
            label={t('Add a journey')}
            onLink={async (url) => {
              await journeyCreate({
                variables: { id: uuidv4(), parentBlockId: block.id, url }
              })
            }}
          />
        </Box>
      ) : (
        cards.length === 0 && (
          <Typography
            variant="body2"
            data-testid="JourneyListEmpty"
            sx={{ color: 'var(--campaign-band-muted)' }}
          >
            {t('Select this section to add a journey.')}
          </Typography>
        )
      )}
    </Stack>
  )
}
