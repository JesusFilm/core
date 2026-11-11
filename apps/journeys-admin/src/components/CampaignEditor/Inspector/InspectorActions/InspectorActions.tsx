import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, ReactNode, useState } from 'react'

import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'
import ChevronLeftIcon from '@core/shared/ui/icons/ChevronLeft'
import ChevronRightIcon from '@core/shared/ui/icons/ChevronRight'
import ChevronUpIcon from '@core/shared/ui/icons/ChevronUp'
import CopyLeftIcon from '@core/shared/ui/icons/CopyLeft'
import Trash2Icon from '@core/shared/ui/icons/Trash2'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../../__generated__/GetCampaign'
import { sortedRegions, useCampaignEditor } from '../../CampaignEditorProvider'
import { SectionDeleteDialog } from '../../SectionDeleteDialog'
import { pageSections } from '../../utils/sectionTypes'
import { siblingsOf } from '../../utils/siblingsOf'
import { useCampaignBlockDeleteCommand } from '../../utils/useCampaignBlockDeleteCommand'
import { useCampaignBlockDuplicateCommand } from '../../utils/useCampaignBlockDuplicateCommand'
import { useCampaignBlockOrderCommand } from '../../utils/useCampaignBlockOrderCommand'
import { useCampaignRegionCommand } from '../../utils/useCampaignRegionCommand'

interface ActionsRowProps {
  children: ReactNode
}

/** The Inspector's actions row under its header. */
function ActionsRow({ children }: ActionsRowProps): ReactElement {
  return (
    <Stack
      direction="row"
      spacing={1}
      data-testid="CampaignInspectorActions"
      sx={{ alignItems: 'center' }}
    >
      {children}
    </Stack>
  )
}

interface MoveButtonsProps {
  /** The selection's place among what it moves among; -1 when it is not there. */
  index: number
  count: number
  /** Up / down for sections and region cards, left / right for cards. */
  direction: 'vertical' | 'horizontal'
  onMove: (step: -1 | 1) => void
}

/** The two move arrows, each disabled at its end of the list. */
function MoveButtons({
  index,
  count,
  direction,
  onMove
}: MoveButtonsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const vertical = direction === 'vertical'

  function handleBack(): void {
    onMove(-1)
  }

  function handleForward(): void {
    onMove(1)
  }

  return (
    <>
      <IconButton
        aria-label={vertical ? t('Move up') : t('Move left')}
        disabled={index <= 0}
        onClick={handleBack}
      >
        {vertical ? <ChevronUpIcon /> : <ChevronLeftIcon />}
      </IconButton>
      <IconButton
        aria-label={vertical ? t('Move down') : t('Move right')}
        disabled={index < 0 || index >= count - 1}
        onClick={handleForward}
      >
        {vertical ? <ChevronDownIcon /> : <ChevronRightIcon />}
      </IconButton>
    </>
  )
}

interface DeleteButtonProps {
  label: string
  /** Deleting a section or emptying a column confirms and points at undo; every other delete is immediate. */
  confirm?: 'section' | 'column'
}

/** Deletes the selected block, as one Command. */
function DeleteButton({ label, confirm }: DeleteButtonProps): ReactElement {
  const { selection, state, pageKindOf } = useCampaignEditor()
  const { addBlockDelete } = useCampaignBlockDeleteCommand()
  const [open, setOpen] = useState(false)

  function handleDelete(): void {
    if (selection.block == null) return
    // A Region Line has no parent block: the delete selects its region card,
    // as Escape does from a line.
    const regionCard =
      selection.region != null && selection.regionHost != null
        ? {
            selectedBlockId: selection.regionHost.id,
            selectedRegionId: selection.region.id
          }
        : undefined
    addBlockDelete(selection.block, regionCard)
  }

  function handleClick(): void {
    if (confirm == null) {
      handleDelete()
      return
    }
    setOpen(true)
  }

  function handleClose(): void {
    setOpen(false)
  }

  function handleConfirm(): void {
    setOpen(false)
    handleDelete()
  }

  return (
    <>
      <IconButton aria-label={label} onClick={handleClick}>
        <Trash2Icon />
      </IconButton>
      {confirm != null && (
        <SectionDeleteDialog
          open={open && selection.block != null}
          variant={confirm}
          pageKind={
            selection.block != null
              ? (pageKindOf(selection.block) ?? state.pageKind)
              : state.pageKind
          }
          onClose={handleClose}
          onConfirm={handleConfirm}
        />
      )}
    </>
  )
}

/** A section: move up / down among the page's sections, duplicate, and delete (confirmed). */
export function SectionActions(): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  const { campaign, selection } = useCampaignEditor()
  const { addBlockOrder } = useCampaignBlockOrderCommand()
  const { addBlockDuplicate } = useCampaignBlockDuplicateCommand()
  const section = selection.block
  if (section == null) return null
  const siblings = pageSections(campaign.blocks, section.pageId)
  const index = siblings.findIndex((candidate) => candidate.id === section.id)

  function handleMove(step: -1 | 1): void {
    if (section?.parentOrder == null) return
    addBlockOrder(section, section.parentOrder + step)
  }

  function handleDuplicate(): void {
    if (section == null) return
    addBlockDuplicate(section)
  }

  return (
    <ActionsRow>
      <MoveButtons
        index={index}
        count={siblings.length}
        direction="vertical"
        onMove={handleMove}
      />
      <IconButton aria-label={t('Duplicate')} onClick={handleDuplicate}>
        <CopyLeftIcon />
      </IconButton>
      <DeleteButton label={t('Delete')} confirm="section" />
    </ActionsRow>
  )
}

/** A section in a Column Slot: empty the column (confirmed). */
export function ColumnActions(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <ActionsRow>
      <DeleteButton label={t('Empty column')} confirm="column" />
    </ActionsRow>
  )
}

interface CardActionsProps {
  card: CampaignBlock
  /** The card and the cards it moves among, in order. */
  cards: CampaignBlock[]
}

/**
 * ← / →: a card takes its neighbour card's position (past any Extras between
 * them), one order Command; and delete.
 */
function CardActions({ card, cards }: CardActionsProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { addBlockOrder } = useCampaignBlockOrderCommand()
  const index = cards.findIndex((candidate) => candidate.id === card.id)

  function handleMove(step: -1 | 1): void {
    const neighbour = cards[index + step]
    if (neighbour?.parentOrder == null) return
    addBlockOrder(card, neighbour.parentOrder)
  }

  return (
    <ActionsRow>
      <MoveButtons
        index={index}
        count={cards.length}
        direction="horizontal"
        onMove={handleMove}
      />
      <DeleteButton label={t('Delete')} />
    </ActionsRow>
  )
}

function byParentOrder(a: CampaignBlock, b: CampaignBlock): number {
  return (a.parentOrder ?? 0) - (b.parentOrder ?? 0)
}

/** A carousel card, among its carousel's items. */
export function CarouselCardActions(): ReactElement | null {
  const { campaign, selection } = useCampaignEditor()
  const card = selection.block
  if (card == null) return null
  const cards = [card, ...siblingsOf(campaign.blocks, card)]
    .filter((candidate) => candidate.__typename === 'CampaignVideoBlock')
    .sort(byParentOrder)
  return <CardActions card={card} cards={cards} />
}

/** A journey card, among its list's journey cards. */
export function JourneyCardActions(): ReactElement | null {
  const { campaign, selection } = useCampaignEditor()
  const card = selection.block
  if (card?.__typename !== 'CampaignJourneyBlock') return null
  const cards = campaign.blocks
    .filter(
      (candidate) =>
        candidate.__typename === 'CampaignJourneyBlock' &&
        candidate.parentBlockId === card.parentBlockId &&
        candidate.parentOrder != null
    )
    .sort(byParentOrder)
  return <CardActions card={card} cards={cards} />
}

/** A region card: move up / down in the region order. */
export function RegionActions(): ReactElement | null {
  const { campaign, selection } = useCampaignEditor()
  const { reorderRegion } = useCampaignRegionCommand()
  const region = selection.region
  if (region == null) return null
  const regions = sortedRegions(campaign.regions)
  const index = regions.findIndex((candidate) => candidate.id === region.id)

  function handleMove(step: -1 | 1): void {
    if (region == null) return
    reorderRegion(region, region.order + step)
  }

  return (
    <ActionsRow>
      <MoveButtons
        index={index}
        count={regions.length}
        direction="vertical"
        onMove={handleMove}
      />
    </ActionsRow>
  )
}

/** A text or button Extra: delete. */
export function ExtraActions(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <ActionsRow>
      <DeleteButton label={t('Delete')} />
    </ActionsRow>
  )
}
