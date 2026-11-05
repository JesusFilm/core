import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import {
  CampaignJourneyCards,
  CampaignJourneyOpenButton,
  type CampaignTreeBlock,
  isJourneyCardVisible,
  journeyCardFrameSx,
  journeyCardImageSx
} from '@core/journeys/ui/Campaign'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../__generated__/GetCampaign'
import { GetCampaignJourneyByLink_journey as ResolvedJourney } from '../../../../__generated__/GetCampaignJourneyByLink'
import {
  CampaignJourneyListDisplay,
  CampaignStringKey
} from '../../../../__generated__/globalTypes'
import { CampaignTextField } from '../../../libs/useCampaignBlockTextMutation'
import { useCampaignJourneyBlockCreateMutation } from '../../../libs/useCampaignJourneyBlockCreateMutation'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { EditorNote } from '../Canvas/EditorNote'
import { HOVER_OUTLINE_SX, SELECTED_OUTLINE } from '../Canvas/hoverOutline'
import { InlineText } from '../Canvas/InlineText'
import { selectableProps } from '../Canvas/selectable'
import { SelectionBadge } from '../Canvas/SelectionBadge'
import { JourneyPasteField } from '../Pickers/JourneyPasteField'
import { JourneyPicker } from '../Pickers/JourneyPicker'
import { blockLabel } from '../utils/blockLabel'
import { campaignStringText } from '../utils/campaignStringText'
import { useCampaignBlockCreateCommand } from '../utils/useCampaignBlockCreateCommand'

type JourneyCardBlock = Extract<
  CampaignBlock,
  { __typename: 'CampaignJourneyBlock' }
>

interface JourneyListEditProps {
  /** The journey list this editor sits in, with its treed children. */
  block: Pick<CampaignBlock, 'id'> & {
    children: Array<CampaignTreeBlock<CampaignBlock>>
    display?: CampaignJourneyListDisplay | null
  }
  /** The list, or one of its cards, is the current selection. */
  active: boolean
  /** The card field that was clicked, which takes focus. */
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
  display: CampaignJourneyListDisplay
  openLabel: string
  selected: boolean
  focusField?: CampaignTextField
  onSelect: (field: CampaignTextField) => void
}

/**
 * One journey card on the canvas: the journey's primary image read live, and
 * the snapshot title and description, which edit in place while the card is
 * selected. A card whose journey is neither published nor archived
 * carries a warning; visitors never see it.
 */
function JourneyCardEdit({
  card,
  display,
  openLabel,
  selected,
  focusField,
  onSelect
}: JourneyCardEditProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const live = isJourneyCardVisible(card.journeyStatus)

  return (
    <Stack
      id={card.id}
      data-testid={`JourneyCard-${card.id}`}
      data-selected={selected}
      data-hoverable
      role="button"
      {...selectableProps(
        () => onSelect('title'),
        blockLabel(t, card.__typename)
      )}
      sx={{
        ...journeyCardFrameSx(display),
        position: 'relative',
        cursor: 'pointer',
        ...HOVER_OUTLINE_SX,
        ...(selected ? SELECTED_OUTLINE : {})
      }}
    >
      <SelectionBadge
        id={card.id}
        label={blockLabel(t, card.__typename)}
        selected={selected}
        placement="inside"
      />
      {card.journeyImage != null && (
        <Box
          component="img"
          src={card.journeyImage.src}
          alt={card.journeyImage.alt ?? ''}
          data-testid="JourneyCardImage"
          sx={journeyCardImageSx(display)}
        />
      )}
      <Stack spacing={1} sx={{ p: 3, flexGrow: 1, alignItems: 'flex-start' }}>
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
          target={{ block: card, field: 'title' }}
          placeholder={t('Journey title')}
          editing={selected}
          autoFocus={selected && focusField === 'title'}
          onSelect={() => onSelect('title')}
          variant="h5"
          component="h3"
          sx={{ color: 'var(--campaign-band-heading)' }}
        />
        <InlineText
          target={{ block: card, field: 'description' }}
          placeholder={t('Journey description')}
          editing={selected}
          autoFocus={selected && focusField === 'description'}
          onSelect={() => onSelect('description')}
          variant="body2"
          sx={{ color: 'var(--campaign-band-muted)' }}
        />
        <Box sx={{ flexGrow: 1 }} />
        <CampaignJourneyOpenButton label={openLabel} />
      </Stack>
    </Stack>
  )
}

/**
 * The Journey List on the editor canvas: every card, live or not, selectable
 * to edit its title and description in place, and — while the list or one of
 * its cards is selected — the journey picker that adds another card from
 * the journeys the author can read, and beneath it a smaller paste field for
 * a journey outside that list (an admin link or a public URL). Adding is one create Command: the card
 * shows at once from the journey picked or resolved, and the server
 * snapshots the journey's title and description when it answers. With no
 * card it shows the campaign's `noJourneys` string, as the public page
 * does, above the hint or the picker; that wording is edited in Settings.
 */
export function JourneyListEdit({
  block,
  active,
  focusField,
  onSelectCard
}: JourneyListEditProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    campaign,
    selection,
    state: { previewLanguageId }
  } = useCampaignEditor()
  const [journeyCreate] = useCampaignJourneyBlockCreateMutation(campaign.id)
  const { addBlock } = useCampaignBlockCreateCommand()
  const [adding, setAdding] = useState(false)
  const cards = journeyCards(block.children)
  const selectedId = selection.block?.id
  const display = block.display ?? CampaignJourneyListDisplay.grid
  const openLabel = campaignStringText(
    campaign,
    CampaignStringKey.openTemplate,
    previewLanguageId,
    t('Open journey')
  )
  // Blank on the public page renders nothing, so it has no fallback here.
  const noJourneysLabel = campaignStringText(
    campaign,
    CampaignStringKey.noJourneys,
    previewLanguageId,
    ''
  )

  async function handleAdd(
    url: string,
    journey: ResolvedJourney
  ): Promise<void> {
    const list = campaign.blocks.find((candidate) => candidate.id === block.id)
    const id = uuidv4()
    const card: CampaignBlock = {
      __typename: 'CampaignJourneyBlock',
      id,
      campaignId: campaign.id,
      pageId: list?.pageId ?? null,
      regionId: list?.regionId ?? null,
      parentBlockId: block.id,
      // The API numbers every ordered child of the list in one sequence,
      // Extras above and below the cards included: the card lands last.
      parentOrder: block.children.filter((child) => child.parentOrder != null)
        .length,
      title: journey.title,
      description: journey.description,
      titleTranslations: [],
      descriptionTranslations: [],
      journeyStatus: journey.status,
      journeyUrl: null,
      journeyImage: null,
      journeyId: journey.id,
      snapshotEdited: false
    }
    let created: Promise<unknown> = Promise.resolve()
    addBlock({
      block: card,
      execute() {
        created = journeyCreate({
          variables: { input: { id, parentBlockId: block.id, url } },
          optimisticResponse: { campaignJourneyBlockCreate: card }
        })
        return created
      }
    })
    // The add fields stay up while the add is in flight: a refused add
    // rolls its optimistic card back before the selection returns to the
    // list, and the fields must still be there to show the API's message.
    setAdding(true)
    try {
      await created
    } finally {
      setAdding(false)
    }
  }

  return (
    <Stack
      spacing={2}
      data-testid="JourneyListEdit"
      sx={{ width: '100%', alignItems: 'stretch' }}
    >
      {cards.length > 0 && (
        <CampaignJourneyCards display={display}>
          {cards.map((card) => (
            <JourneyCardEdit
              key={card.id}
              card={card}
              display={display}
              openLabel={openLabel}
              selected={selectedId === card.id}
              focusField={focusField}
              onSelect={(field) => onSelectCard(card.id, field)}
            />
          ))}
        </CampaignJourneyCards>
      )}
      {cards.length === 0 && noJourneysLabel.trim() !== '' && (
        <Typography
          variant="body1"
          data-testid="JourneyListNoJourneys"
          sx={{ color: 'var(--campaign-band-muted)', whiteSpace: 'pre-line' }}
        >
          {noJourneysLabel}
        </Typography>
      )}
      {active || adding ? (
        <Stack spacing={1.5} sx={{ maxWidth: 720 }}>
          <JourneyPicker label={t('Add a journey')} onLink={handleAdd} />
          <JourneyPasteField label={t('or paste a link')} onLink={handleAdd} />
        </Stack>
      ) : (
        cards.length === 0 && (
          <EditorNote testId="JourneyListEmpty">
            {t('Select this section to add a journey.')}
          </EditorNote>
        )
      )}
    </Stack>
  )
}
