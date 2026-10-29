import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, useState } from 'react'

import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'
import ChevronLeftIcon from '@core/shared/ui/icons/ChevronLeft'
import ChevronRightIcon from '@core/shared/ui/icons/ChevronRight'
import ChevronUpIcon from '@core/shared/ui/icons/ChevronUp'
import CopyLeftIcon from '@core/shared/ui/icons/CopyLeft'
import Trash2Icon from '@core/shared/ui/icons/Trash2'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../__generated__/GetCampaign'
import { sortedRegions, useCampaignEditor } from '../CampaignEditorProvider'
import { SectionDeleteDialog } from '../SectionDeleteDialog'
import { pageSections } from '../sectionTypes'
import { siblingsOf } from '../utils/siblingsOf'
import { useCampaignBlockDeleteCommand } from '../utils/useCampaignBlockDeleteCommand'
import { useCampaignBlockDuplicateCommand } from '../utils/useCampaignBlockDuplicateCommand'
import { useCampaignBlockOrderCommand } from '../utils/useCampaignBlockOrderCommand'
import { useCampaignRegionCommand } from '../utils/useCampaignRegionCommand'

/**
 * The Inspector's actions row for the selection: move up / down for a
 * section (left / right for a carousel or journey card, the region order for
 * a region card), duplicate for a section and delete. Each is the same
 * Command as before the Inspector. Deleting a section or emptying a column
 * confirms and points at undo; every other delete is immediate.
 */
export function InspectorActions(): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')
  const { campaign, selection, state, pageKindOf } = useCampaignEditor()
  const { reorderRegion } = useCampaignRegionCommand()
  const { addBlockDelete } = useCampaignBlockDeleteCommand()
  const { addBlockDuplicate } = useCampaignBlockDuplicateCommand()
  const { addBlockOrder } = useCampaignBlockOrderCommand()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const selectedSection =
    selection.kind === 'section' ? selection.block : undefined
  const sectionSiblings =
    selectedSection != null
      ? pageSections(campaign.blocks, selectedSection.pageId)
      : []
  const sectionIndex = sectionSiblings.findIndex(
    (candidate) => candidate.id === selectedSection?.id
  )

  /** A selected card's neighbours among its carousel's items, which the arrows swap it with. */
  const selectedCard = selection.kind === 'card' ? selection.block : undefined
  const cardItems =
    selectedCard != null
      ? [selectedCard, ...siblingsOf(campaign.blocks, selectedCard)]
          .filter((candidate) => candidate.__typename === 'CampaignVideoBlock')
          .sort((a, b) => (a.parentOrder ?? 0) - (b.parentOrder ?? 0))
      : []
  const cardIndex = cardItems.findIndex(
    (candidate) => candidate.id === selectedCard?.id
  )

  const selectedJourneyCard =
    selection.kind === 'journey' &&
    selection.block?.__typename === 'CampaignJourneyBlock'
      ? selection.block
      : undefined
  const journeyCardSiblings =
    selectedJourneyCard != null
      ? campaign.blocks
          .filter(
            (candidate) =>
              candidate.__typename === 'CampaignJourneyBlock' &&
              candidate.parentBlockId === selectedJourneyCard.parentBlockId &&
              candidate.parentOrder != null
          )
          .sort((a, b) => (a.parentOrder ?? 0) - (b.parentOrder ?? 0))
      : []
  const journeyCardIndex = journeyCardSiblings.findIndex(
    (candidate) => candidate.id === selectedJourneyCard?.id
  )

  const selectedRegion =
    selection.kind === 'region' ? selection.region : undefined
  const regionSiblings = sortedRegions(campaign.regions)
  const regionIndex = regionSiblings.findIndex(
    (candidate) => candidate.id === selectedRegion?.id
  )

  function handleMove(step: -1 | 1): void {
    if (selectedSection?.parentOrder == null) return
    addBlockOrder(selectedSection, selectedSection.parentOrder + step)
  }

  /**
   * ← / →: a carousel card takes its neighbour item's position, a journey
   * card its neighbour card's (past any Extras between them); one order
   * Command.
   */
  function handleMoveSideways(
    card: CampaignBlock | undefined,
    cards: CampaignBlock[],
    index: number,
    step: -1 | 1
  ): void {
    const neighbour = cards[index + step]
    if (card == null || neighbour?.parentOrder == null) return
    addBlockOrder(card, neighbour.parentOrder)
  }

  function handleMoveRegion(step: -1 | 1): void {
    if (selectedRegion == null) return
    reorderRegion(selectedRegion, selectedRegion.order + step)
  }

  function handleDuplicate(): void {
    if (selectedSection == null) return
    addBlockDuplicate(selectedSection)
  }

  function handleDelete(): void {
    if (selection.block == null) return
    addBlockDelete(selection.block)
  }

  function handleConfirmDelete(): void {
    setDeleteOpen(false)
    handleDelete()
  }

  const moveUp = (index: number, onClick: () => void): ReactElement => (
    <IconButton
      aria-label={t('Move up')}
      disabled={index <= 0}
      onClick={onClick}
    >
      <ChevronUpIcon />
    </IconButton>
  )
  const moveDown = (
    index: number,
    count: number,
    onClick: () => void
  ): ReactElement => (
    <IconButton
      aria-label={t('Move down')}
      disabled={index < 0 || index >= count - 1}
      onClick={onClick}
    >
      <ChevronDownIcon />
    </IconButton>
  )
  const moveSideways = (
    index: number,
    count: number,
    onMove: (step: -1 | 1) => void
  ): ReactElement => (
    <>
      <IconButton
        aria-label={t('Move left')}
        disabled={index <= 0}
        onClick={() => onMove(-1)}
      >
        <ChevronLeftIcon />
      </IconButton>
      <IconButton
        aria-label={t('Move right')}
        disabled={index < 0 || index >= count - 1}
        onClick={() => onMove(1)}
      >
        <ChevronRightIcon />
      </IconButton>
    </>
  )
  const deleteButton = (label: string, confirm: boolean): ReactElement => (
    <IconButton
      aria-label={label}
      onClick={confirm ? () => setDeleteOpen(true) : handleDelete}
    >
      <Trash2Icon />
    </IconButton>
  )

  function renderActions(): ReactElement | null {
    switch (selection.kind) {
      case 'section':
        return (
          <>
            {moveUp(sectionIndex, () => handleMove(-1))}
            {moveDown(sectionIndex, sectionSiblings.length, () =>
              handleMove(1)
            )}
            <IconButton aria-label={t('Duplicate')} onClick={handleDuplicate}>
              <CopyLeftIcon />
            </IconButton>
            {deleteButton(t('Delete'), true)}
          </>
        )
      case 'column':
        return deleteButton(t('Empty column'), true)
      case 'card':
        return (
          <>
            {moveSideways(cardIndex, cardItems.length, (step) =>
              handleMoveSideways(selectedCard, cardItems, cardIndex, step)
            )}
            {deleteButton(t('Delete'), false)}
          </>
        )
      case 'journey':
        return (
          <>
            {moveSideways(
              journeyCardIndex,
              journeyCardSiblings.length,
              (step) =>
                handleMoveSideways(
                  selectedJourneyCard,
                  journeyCardSiblings,
                  journeyCardIndex,
                  step
                )
            )}
            {deleteButton(t('Delete'), false)}
          </>
        )
      case 'region':
        return selectedRegion == null ? null : (
          <>
            {moveUp(regionIndex, () => handleMoveRegion(-1))}
            {moveDown(regionIndex, regionSiblings.length, () =>
              handleMoveRegion(1)
            )}
          </>
        )
      case 'text':
      case 'button':
        return deleteButton(t('Delete'), false)
      default:
        return null
    }
  }

  const actions = renderActions()
  if (actions == null) return null

  return (
    <Stack
      direction="row"
      spacing={1}
      data-testid="CampaignInspectorActions"
      sx={{ alignItems: 'center' }}
    >
      {actions}
      <SectionDeleteDialog
        open={deleteOpen && selection.block != null}
        variant={selection.kind === 'column' ? 'column' : 'section'}
        pageKind={
          selection.block != null
            ? (pageKindOf(selection.block) ?? state.pageKind)
            : state.pageKind
        }
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </Stack>
  )
}
