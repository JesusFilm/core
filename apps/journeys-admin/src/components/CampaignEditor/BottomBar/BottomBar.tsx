import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next/pages'
import { MouseEvent, ReactElement, ReactNode, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import ArrowLeftIcon from '@core/shared/ui/icons/ArrowLeft'
import ArrowRefresh6Icon from '@core/shared/ui/icons/ArrowRefresh6'
import ArrowRightIcon from '@core/shared/ui/icons/ArrowRight'
import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'
import ChevronLeftIcon from '@core/shared/ui/icons/ChevronLeft'
import ChevronRightIcon from '@core/shared/ui/icons/ChevronRight'
import ChevronUpIcon from '@core/shared/ui/icons/ChevronUp'
import CopyLeftIcon from '@core/shared/ui/icons/CopyLeft'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import EyeClosedIcon from '@core/shared/ui/icons/EyeClosed'
import EyeOpenIcon from '@core/shared/ui/icons/EyeOpen'
import Globe1Icon from '@core/shared/ui/icons/Globe1'
import Layout1Icon from '@core/shared/ui/icons/Layout1'
import LinkIcon from '@core/shared/ui/icons/Link'
import LinkExternalIcon from '@core/shared/ui/icons/LinkExternal'
import PaletteIcon from '@core/shared/ui/icons/Palette'
import Plus2Icon from '@core/shared/ui/icons/Plus2'
import SettingsIcon from '@core/shared/ui/icons/Settings'
import TranslateIcon from '@core/shared/ui/icons/Translate'
import Trash2Icon from '@core/shared/ui/icons/Trash2'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../__generated__/GetCampaign'
import { CampaignChildPlacement } from '../../../../__generated__/globalTypes'
import { useCampaignButtonBlockCreateMutation } from '../../../libs/useCampaignButtonBlockCreateMutation'
import { isCampaignMediaOwner } from '../../../libs/useCampaignMediaSlotMutation'
import {
  CampaignSectionTypename,
  useCampaignSectionCreateMutation
} from '../../../libs/useCampaignSectionCreateMutation'
import { isCampaignStyledBlock } from '../../../libs/useCampaignSectionStyleMutation'
import { useCampaignTypographyBlockCreateMutation } from '../../../libs/useCampaignTypographyBlockCreateMutation'
import { BarButton } from '../BarButton'
import { blockLabel } from '../blockLabel'
import { ButtonControls } from '../ButtonControls'
import { campaignPermanentAddress } from '../campaignAddress'
import {
  regionLines,
  sortedRegions,
  useCampaignEditor
} from '../CampaignEditorProvider'
import { CarouselCardEdit } from '../CarouselCardEdit'
import { CarouselEdit } from '../CarouselEdit'
import { ChromeEdit } from '../ChromeEdit'
import { ImageSectionEdit } from '../ImageSectionEdit'
import { LinkChip } from '../LinkChip'
import { MediaSectionEdit } from '../MediaSectionEdit'
import { OrphanPageBar } from '../OrphanPageBar'
import { SectionDeleteDialog } from '../SectionDeleteDialog'
import {
  columnSlots,
  newColumnSlots,
  newSectionBlock,
  pageSections,
  sectionTypesForPage,
  sectionTypesForSlot,
  slotSection
} from '../sectionTypes'
import { StylePanel } from '../StylePanel'
import { TextControls } from '../TextControls'
import { useCampaignBlockCreateCommand } from '../utils/useCampaignBlockCreateCommand'
import {
  siblingsOf,
  useCampaignBlockDeleteCommand
} from '../utils/useCampaignBlockDeleteCommand'
import { useCampaignBlockDuplicateCommand } from '../utils/useCampaignBlockDuplicateCommand'
import { useCampaignBlockOrderCommand } from '../utils/useCampaignBlockOrderCommand'
import { useCampaignRegionCommand } from '../utils/useCampaignRegionCommand'
import { useChangeTypeCommand } from '../utils/useChangeTypeCommand'
import { useColumnSwapCommand } from '../utils/useColumnSwapCommand'
import { useJourneyCardSnapshotRefreshCommand } from '../utils/useJourneyCardSnapshotRefreshCommand'

import { Breadcrumb } from './Breadcrumb'

/** The ⇄ glyph of the column swap control; a symbol, not copy to translate. */
const SWAP_GLYPH = '\u21c4'

/** The label a new button Extra is born with (PRD §14); campaign content, not UI copy. */
export const NEW_BUTTON_LABEL = 'Button'

interface BottomBarProps {
  onSettingsClick: () => void
  onThemeClick: () => void
  /** Opens the Languages panel (add and remove campaign languages). */
  onLanguagesClick?: () => void
  /** Opens the Translations view (review and edit translated text). */
  onTranslationsClick?: () => void
  /** Opens the selected region's settings (name, slug, countries). */
  onRegionSettingsClick?: () => void
}

type ExtraTypename = 'CampaignTypographyBlock' | 'CampaignButtonBlock'

/**
 * Where a new section goes: a page and a position among its sections, or a
 * Column Slot, whose one section is always at position 0.
 */
interface SectionInsert {
  pageId: string
  parentOrder: number
  parentBlockId?: string
}

/**
 * The one contextual bottom bar: the breadcrumb, then the controls for what
 * is selected. Campaign row: Settings, Theme, Languages, Translations, +Add
 * section. Section: Edit, Style, +Add (an Extra, or a section above or
 * below), move up/down, duplicate, bin behind a confirmation. Chrome: Edit,
 * Style, +Add only; the header's Edit opens the logo editor, an Image
 * section's Edit the picture editor, a hero's or Featured Media section's
 * Edit the media editor and a Video Carousel's Edit the carousel editor, all
 * in a drawer. Carousel card: Edit (its title and description), ← → (one
 * order Command each) and bin (a delete Command, no confirmation). Column
 * child (the section in a Column Slot): Edit, Style, Change type, +Add
 * (Extras only), ⇄ swap the two slots, bin behind a confirmation that empties
 * the column. Column Slot: a type picker while empty, ⇄ swap. Text Extra:
 * size, align, colour, Style, bin. Button Extra adds the link chip and
 * variant/size/colours. Journey card: Edit, ← → among the list's cards,
 * Refresh from journey, bin. Region card: Open page, +Add line, Settings,
 * list/unlist and move. On an Orphan Page the campaign row adds the orphan
 * page bar. Controls that belong to later tickets render disabled.
 */
export function BottomBar({
  onSettingsClick,
  onThemeClick,
  onLanguagesClick,
  onTranslationsClick,
  onRegionSettingsClick
}: BottomBarProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    campaign,
    selection,
    currentRegion,
    state: { pageKind },
    dispatch,
    pageKindOf
  } = useCampaignEditor()
  const { addBlock } = useCampaignBlockCreateCommand()
  const { setListed, reorderRegion } = useCampaignRegionCommand()
  const { addBlockDelete } = useCampaignBlockDeleteCommand()
  const { addBlockDuplicate } = useCampaignBlockDuplicateCommand()
  const { addBlockOrder } = useCampaignBlockOrderCommand()
  const { addColumnSwap } = useColumnSwapCommand()
  const { addChangeType } = useChangeTypeCommand()
  const { refreshSnapshot, confirmDialog } =
    useJourneyCardSnapshotRefreshCommand()
  const [typographyCreate] = useCampaignTypographyBlockCreateMutation(
    campaign.id
  )
  const [buttonCreate] = useCampaignButtonBlockCreateMutation(campaign.id)
  const sectionCreate = useCampaignSectionCreateMutation(campaign.id)
  const [addAnchor, setAddAnchor] = useState<HTMLElement | null>(null)
  const [sectionMenu, setSectionMenu] = useState<{
    anchor: HTMLElement
    insert: SectionInsert
  } | null>(null)
  const [changeTypeAnchor, setChangeTypeAnchor] = useState<HTMLElement | null>(
    null
  )
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [styleOpen, setStyleOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  /** The section or chrome block the Style panel edits: the selection's host. */
  const styledHost =
    selection.host != null && isCampaignStyledBlock(selection.host)
      ? selection.host
      : undefined
  const selectedSection =
    selection.kind === 'section' ? selection.block : undefined
  const sectionSiblings =
    selectedSection != null
      ? pageSections(campaign.blocks, selectedSection.pageId)
      : []
  const sectionIndex = sectionSiblings.findIndex(
    (candidate) => candidate.id === selectedSection?.id
  )

  const selectedSlot =
    selection.kind === 'slot'
      ? selection.block
      : selection.kind === 'column'
        ? campaign.blocks.find(
            (candidate) => candidate.id === selection.block?.parentBlockId
          )
        : undefined
  const slotIsEmpty =
    selectedSlot != null &&
    slotSection(campaign.blocks, selectedSlot.id) == null
  const columnsSlotCount =
    selectedSlot?.parentBlockId != null
      ? columnSlots(campaign.blocks, selectedSlot.parentBlockId).length
      : 0
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

  /** ← → move a card among the list's cards, past any Extras between them. */
  function handleMoveJourneyCard(step: -1 | 1): void {
    const target = journeyCardSiblings[journeyCardIndex + step]
    if (selectedJourneyCard == null || target?.parentOrder == null) return
    addBlockOrder(selectedJourneyCard, target.parentOrder)
  }

  /** The header, an Image section, the sections with a Media Slot, a Video Carousel and its cards edit in a drawer (logo, picture, media, videos, card text); everything else edits its text in place. */
  const editedBlock =
    selection.block != null &&
    (selection.block.__typename === 'CampaignHeaderBlock' ||
      selection.block.__typename === 'CampaignImageBlock' ||
      selection.block.__typename === 'CampaignVideoCarouselBlock' ||
      selection.kind === 'card' ||
      isCampaignMediaOwner(selection.block))
      ? selection.block
      : undefined

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

  function handleEdit(): void {
    if (editedBlock != null) {
      setEditOpen(true)
      return
    }
    dispatch({ type: 'RequestEditAction' })
  }

  function handleAddExtra(
    typename: ExtraTypename,
    placement: CampaignChildPlacement
  ): void {
    setAddAnchor(null)
    const host = selection.host
    if (host == null) return
    const id = uuidv4()
    const siblings = campaign.blocks.filter(
      (candidate) =>
        candidate.parentBlockId === host.id && candidate.parentOrder != null
    )
    const base = {
      id,
      campaignId: campaign.id,
      pageId: host.pageId,
      regionId: host.regionId,
      parentBlockId: host.id,
      parentOrder: siblings.length,
      placement
    }
    const input = {
      id,
      campaignId: campaign.id,
      parentBlockId: host.id,
      placement
    }
    if (typename === 'CampaignTypographyBlock') {
      const block: CampaignBlock = {
        __typename: 'CampaignTypographyBlock',
        ...base,
        content: '',
        contentTranslations: [],
        typographyVariant: null,
        align: null,
        color: null
      }
      addBlock({
        block,
        execute() {
          void typographyCreate({
            variables: { input },
            optimisticResponse: { campaignTypographyBlockCreate: block }
          })
        }
      })
      return
    }
    const block: CampaignBlock = {
      __typename: 'CampaignButtonBlock',
      ...base,
      label: NEW_BUTTON_LABEL,
      labelTranslations: [],
      buttonVariant: null,
      size: null,
      align: null,
      color: null,
      labelColor: null,
      action: null
    }
    addBlock({
      block,
      execute() {
        void buttonCreate({
          variables: { input: { ...input, label: NEW_BUTTON_LABEL } },
          optimisticResponse: { campaignButtonBlockCreate: block }
        })
      }
    })
  }

  /** The campaign row's "+Add section": appended to the page the canvas shows. */
  function handleAddSectionClick(event: MouseEvent<HTMLButtonElement>): void {
    const page = campaign.pages.find((candidate) => candidate.kind === pageKind)
    if (page == null) return
    setSectionMenu({
      anchor: event.currentTarget,
      insert: {
        pageId: page.id,
        parentOrder: pageSections(campaign.blocks, page.id).length
      }
    })
  }

  /** A section's "+Add": a sibling section above or below it, never a child. */
  function handleSectionPlacement(where: 'above' | 'below'): void {
    const anchor = addAnchor
    setAddAnchor(null)
    const host = selection.host
    if (anchor == null || host?.pageId == null || host.parentOrder == null)
      return
    setSectionMenu({
      anchor,
      insert: {
        pageId: host.pageId,
        parentOrder: where === 'above' ? host.parentOrder : host.parentOrder + 1
      }
    })
  }

  function handleAddSection(typename: CampaignSectionTypename): void {
    const insert = sectionMenu?.insert
    setSectionMenu(null)
    if (insert == null) return
    const id = uuidv4()
    const block = newSectionBlock(typename, {
      id,
      campaignId: campaign.id,
      ...insert
    })
    const slotIds: [string, string] | undefined =
      typename === 'CampaignColumnsBlock' ? [uuidv4(), uuidv4()] : undefined
    const input = {
      id,
      campaignId: campaign.id,
      ...insert,
      ...(slotIds != null ? { slotIds } : {})
    }
    const slots = slotIds != null ? newColumnSlots(block, slotIds) : []
    addBlock({
      block,
      execute() {
        void sectionCreate(block, input, slots)
      }
    })
  }

  /** An empty slot's "Choose type": the picked section is the slot's only child. */
  function handleChooseSlotType(event: MouseEvent<HTMLButtonElement>): void {
    if (selectedSlot?.pageId == null) return
    setSectionMenu({
      anchor: event.currentTarget,
      insert: {
        pageId: selectedSlot.pageId,
        parentBlockId: selectedSlot.id,
        parentOrder: 0
      }
    })
  }

  function handleChangeType(typename: CampaignSectionTypename): void {
    setChangeTypeAnchor(null)
    if (selection.block == null) return
    addChangeType(selection.block, typename)
  }

  function handleSwap(): void {
    if (selectedSlot == null) return
    addColumnSwap(selectedSlot, selection.block?.id)
  }

  function handleMove(step: -1 | 1): void {
    if (selectedSection?.parentOrder == null) return
    addBlockOrder(selectedSection, selectedSection.parentOrder + step)
  }

  /** ← / →: the card takes its neighbour item's position, one order Command. */
  function handleCardMove(step: -1 | 1): void {
    const neighbour = cardItems[cardIndex + step]
    if (selectedCard == null || neighbour?.parentOrder == null) return
    addBlockOrder(selectedCard, neighbour.parentOrder)
  }

  /** A region card's "+Add line": a Typography block scoped to the region, last among its lines. */
  function handleAddLine(): void {
    const region = selection.region
    if (region == null) return
    const id = uuidv4()
    const block: CampaignBlock = {
      __typename: 'CampaignTypographyBlock',
      id,
      campaignId: campaign.id,
      pageId: null,
      regionId: region.id,
      parentBlockId: null,
      parentOrder: regionLines(campaign.blocks, region.id).length,
      content: '',
      contentTranslations: [],
      typographyVariant: null,
      align: null,
      color: null,
      placement: null
    }
    addBlock({
      block,
      execute() {
        void typographyCreate({
          variables: {
            input: { id, campaignId: campaign.id, regionId: region.id }
          },
          optimisticResponse: { campaignTypographyBlockCreate: block }
        })
      }
    })
  }

  const selectedRegion =
    selection.kind === 'region' ? selection.region : undefined
  const regionSiblings = sortedRegions(campaign.regions)
  const regionIndex = regionSiblings.findIndex(
    (candidate) => candidate.id === selectedRegion?.id
  )

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

  const sectionMenuPageKind =
    campaign.pages.find(
      (candidate) => candidate.id === sectionMenu?.insert.pageId
    )?.kind ?? pageKind

  const addButton = (
    <>
      <BarButton
        label={t('Add')}
        icon={<Plus2Icon />}
        onClick={(event) => setAddAnchor(event.currentTarget)}
      />
      <Menu
        anchorEl={addAnchor}
        open={addAnchor != null}
        onClose={() => setAddAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <MenuItem
          onClick={() =>
            handleAddExtra(
              'CampaignTypographyBlock',
              CampaignChildPlacement.above
            )
          }
        >
          {t('Text above')}
        </MenuItem>
        <MenuItem
          onClick={() =>
            handleAddExtra(
              'CampaignTypographyBlock',
              CampaignChildPlacement.below
            )
          }
        >
          {t('Text below')}
        </MenuItem>
        <MenuItem
          onClick={() =>
            handleAddExtra('CampaignButtonBlock', CampaignChildPlacement.above)
          }
        >
          {t('Button above')}
        </MenuItem>
        <MenuItem
          onClick={() =>
            handleAddExtra('CampaignButtonBlock', CampaignChildPlacement.below)
          }
        >
          {t('Button below')}
        </MenuItem>
        {selectedSection != null && <Divider />}
        {selectedSection != null && (
          <MenuItem onClick={() => handleSectionPlacement('above')}>
            {t('Section above')}
          </MenuItem>
        )}
        {selectedSection != null && (
          <MenuItem onClick={() => handleSectionPlacement('below')}>
            {t('Section below')}
          </MenuItem>
        )}
      </Menu>
    </>
  )

  const sectionTypeMenu = (
    <Menu
      anchorEl={sectionMenu?.anchor}
      open={sectionMenu != null}
      onClose={() => setSectionMenu(null)}
      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      data-testid="CampaignSectionTypeMenu"
    >
      {(sectionMenu?.insert.parentBlockId != null
        ? sectionTypesForSlot(sectionMenuPageKind)
        : sectionTypesForPage(sectionMenuPageKind)
      ).map((typename) => (
        <MenuItem key={typename} onClick={() => handleAddSection(typename)}>
          {blockLabel(t, typename)}
        </MenuItem>
      ))}
    </Menu>
  )

  const changeTypeMenu = (
    <Menu
      anchorEl={changeTypeAnchor}
      open={changeTypeAnchor != null}
      onClose={() => setChangeTypeAnchor(null)}
      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      data-testid="CampaignChangeTypeMenu"
    >
      {sectionTypesForSlot(
        pageKindOf(selection.block ?? { pageId: null }) ?? pageKind
      )
        .filter((typename) => typename !== selection.block?.__typename)
        .map((typename) => (
          <MenuItem key={typename} onClick={() => handleChangeType(typename)}>
            {blockLabel(t, typename)}
          </MenuItem>
        ))}
    </Menu>
  )

  const swapButton = (
    <IconButton
      aria-label={t('Swap columns')}
      disabled={columnsSlotCount < 2}
      onClick={handleSwap}
    >
      {SWAP_GLYPH}
    </IconButton>
  )

  const styleButton = (
    <BarButton
      label={t('Style')}
      icon={<PaletteIcon />}
      onClick={() => setStyleOpen(true)}
      disabled={styledHost == null}
      active={styleOpen}
    />
  )

  const binButton = (
    <IconButton aria-label={t('Delete')} onClick={handleDelete}>
      <Trash2Icon />
    </IconButton>
  )

  function renderControls(): ReactNode {
    switch (selection.kind) {
      case 'campaign':
        return (
          <>
            {currentRegion != null && !currentRegion.listed && (
              <OrphanPageBar region={currentRegion} />
            )}
            <BarButton
              label={t('Settings')}
              icon={<SettingsIcon />}
              onClick={onSettingsClick}
            />
            <BarButton
              label={t('Theme')}
              icon={<PaletteIcon />}
              onClick={onThemeClick}
            />
            <BarButton
              label={t('Languages')}
              icon={<Globe1Icon />}
              onClick={onLanguagesClick}
              disabled={onLanguagesClick == null}
            />
            <BarButton
              label={t('Translations')}
              icon={<TranslateIcon />}
              onClick={onTranslationsClick}
              disabled={onTranslationsClick == null}
            />
            <BarButton
              label={t('Add section')}
              icon={<Plus2Icon />}
              onClick={handleAddSectionClick}
            />
          </>
        )
      case 'section':
        return (
          <>
            <BarButton
              label={t('Edit')}
              icon={<Edit2Icon />}
              onClick={handleEdit}
            />
            {styleButton}
            {addButton}
            <IconButton
              aria-label={t('Move up')}
              disabled={sectionIndex <= 0}
              onClick={() => handleMove(-1)}
            >
              <ChevronUpIcon />
            </IconButton>
            <IconButton
              aria-label={t('Move down')}
              disabled={
                sectionIndex < 0 || sectionIndex >= sectionSiblings.length - 1
              }
              onClick={() => handleMove(1)}
            >
              <ChevronDownIcon />
            </IconButton>
            <IconButton aria-label={t('Duplicate')} onClick={handleDuplicate}>
              <CopyLeftIcon />
            </IconButton>
            <IconButton
              aria-label={t('Delete')}
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2Icon />
            </IconButton>
          </>
        )
      case 'column':
        return (
          <>
            <BarButton
              label={t('Edit')}
              icon={<Edit2Icon />}
              onClick={handleEdit}
            />
            {styleButton}
            <BarButton
              label={t('Change type')}
              icon={<Layout1Icon />}
              onClick={(event) => setChangeTypeAnchor(event.currentTarget)}
            />
            {addButton}
            {swapButton}
            <IconButton
              aria-label={t('Empty column')}
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2Icon />
            </IconButton>
          </>
        )
      case 'slot':
        return (
          <>
            {slotIsEmpty && (
              <BarButton
                label={t('Choose type')}
                icon={<Plus2Icon />}
                onClick={handleChooseSlotType}
              />
            )}
            {swapButton}
          </>
        )
      case 'chrome':
        return (
          <>
            <BarButton
              label={t('Edit')}
              icon={<Edit2Icon />}
              onClick={handleEdit}
            />
            {styleButton}
            {addButton}
          </>
        )
      case 'card':
        return (
          <>
            <BarButton
              label={t('Edit')}
              icon={<Edit2Icon />}
              onClick={handleEdit}
            />
            <IconButton
              aria-label={t('Move left')}
              disabled={cardIndex <= 0}
              onClick={() => handleCardMove(-1)}
            >
              <ArrowLeftIcon />
            </IconButton>
            <IconButton
              aria-label={t('Move right')}
              disabled={cardIndex < 0 || cardIndex >= cardItems.length - 1}
              onClick={() => handleCardMove(1)}
            >
              <ArrowRightIcon />
            </IconButton>
            {binButton}
          </>
        )
      case 'region':
        return selectedRegion == null ? null : (
          <>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<LinkExternalIcon />}
              href={`${campaignPermanentAddress(campaign.slug)}/${selectedRegion.slug}`}
              target="_blank"
              rel="noopener"
            >
              {t('Open page')}
            </Button>
            <BarButton
              label={t('Add line')}
              icon={<Plus2Icon />}
              onClick={handleAddLine}
            />
            <BarButton
              label={t('Settings')}
              icon={<SettingsIcon />}
              onClick={onRegionSettingsClick}
            />
            <BarButton
              label={
                selectedRegion.listed ? t('Unlist') : t('List on switcher')
              }
              icon={selectedRegion.listed ? <EyeClosedIcon /> : <EyeOpenIcon />}
              onClick={() => setListed(selectedRegion, !selectedRegion.listed)}
            />
            <IconButton
              aria-label={t('Move up')}
              disabled={regionIndex <= 0}
              onClick={() => handleMoveRegion(-1)}
            >
              <ChevronUpIcon />
            </IconButton>
            <IconButton
              aria-label={t('Move down')}
              disabled={
                regionIndex < 0 || regionIndex >= regionSiblings.length - 1
              }
              onClick={() => handleMoveRegion(1)}
            >
              <ChevronDownIcon />
            </IconButton>
          </>
        )
      case 'journey':
        return selectedJourneyCard == null ? null : (
          <>
            <BarButton
              label={t('Edit')}
              icon={<Edit2Icon />}
              onClick={handleEdit}
            />
            <IconButton
              aria-label={t('Move left')}
              disabled={journeyCardIndex <= 0}
              onClick={() => handleMoveJourneyCard(-1)}
            >
              <ChevronLeftIcon />
            </IconButton>
            <IconButton
              aria-label={t('Move right')}
              disabled={
                journeyCardIndex < 0 ||
                journeyCardIndex >= journeyCardSiblings.length - 1
              }
              onClick={() => handleMoveJourneyCard(1)}
            >
              <ChevronRightIcon />
            </IconButton>
            <BarButton
              label={t('Refresh from journey')}
              icon={<ArrowRefresh6Icon />}
              onClick={() => {
                void refreshSnapshot(selectedJourneyCard)
              }}
            />
            {binButton}
          </>
        )
      case 'text':
        return (
          <>
            {selection.block?.__typename === 'CampaignTypographyBlock' && (
              <TextControls block={selection.block} />
            )}
            {styleButton}
            {binButton}
          </>
        )
      case 'button':
        return (
          <>
            {selection.block?.__typename === 'CampaignButtonBlock' && (
              <>
                <LinkChip block={selection.block} />
                <ButtonControls block={selection.block} />
              </>
            )}
            {styleButton}
            {binButton}
          </>
        )
    }
  }

  return (
    <Stack
      direction="row"
      spacing={2}
      data-testid="CampaignBottomBar"
      data-selection={selection.kind}
      sx={{
        px: 4,
        py: 2,
        alignItems: 'center',
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper'
      }}
    >
      <Breadcrumb />
      <Divider orientation="vertical" flexItem />
      {renderControls()}
      {sectionTypeMenu}
      {changeTypeMenu}
      {confirmDialog}
      <SectionDeleteDialog
        open={deleteOpen && selection.block != null}
        variant={selection.kind === 'column' ? 'column' : 'section'}
        pageKind={
          selection.block != null
            ? (pageKindOf(selection.block) ?? pageKind)
            : pageKind
        }
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
      <Drawer
        anchor="right"
        open={styleOpen && styledHost != null}
        onClose={() => setStyleOpen(false)}
      >
        {styledHost != null && (
          <StylePanel block={styledHost} onClose={() => setStyleOpen(false)} />
        )}
      </Drawer>
      <Drawer
        anchor="right"
        open={editOpen && editedBlock != null}
        onClose={() => setEditOpen(false)}
      >
        {editedBlock?.__typename === 'CampaignHeaderBlock' && (
          <ChromeEdit block={editedBlock} onClose={() => setEditOpen(false)} />
        )}
        {editedBlock?.__typename === 'CampaignImageBlock' && (
          <ImageSectionEdit
            block={editedBlock}
            onClose={() => setEditOpen(false)}
          />
        )}
        {editedBlock?.__typename === 'CampaignVideoCarouselBlock' && (
          <CarouselEdit
            block={editedBlock}
            onClose={() => setEditOpen(false)}
          />
        )}
        {editedBlock?.__typename === 'CampaignVideoBlock' && (
          <CarouselCardEdit
            block={editedBlock}
            onClose={() => setEditOpen(false)}
          />
        )}
        {editedBlock != null && isCampaignMediaOwner(editedBlock) && (
          <MediaSectionEdit
            block={editedBlock}
            onClose={() => setEditOpen(false)}
          />
        )}
      </Drawer>
    </Stack>
  )
}
