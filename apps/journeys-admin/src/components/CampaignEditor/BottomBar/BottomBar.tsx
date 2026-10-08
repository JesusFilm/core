import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next/pages'
import { MouseEvent, ReactElement, ReactNode, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'
import ChevronUpIcon from '@core/shared/ui/icons/ChevronUp'
import CopyLeftIcon from '@core/shared/ui/icons/CopyLeft'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import EyeClosedIcon from '@core/shared/ui/icons/EyeClosed'
import EyeOpenIcon from '@core/shared/ui/icons/EyeOpen'
import Globe1Icon from '@core/shared/ui/icons/Globe1'
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
import { OrphanPageBar } from '../OrphanPageBar'
import { SectionDeleteDialog } from '../SectionDeleteDialog'
import {
  newSectionBlock,
  pageSections,
  sectionTypesForPage
} from '../sectionTypes'
import { StylePanel } from '../StylePanel'
import { TextControls } from '../TextControls'
import { useCampaignBlockCreateCommand } from '../utils/useCampaignBlockCreateCommand'
import { useCampaignBlockDeleteCommand } from '../utils/useCampaignBlockDeleteCommand'
import { useCampaignBlockDuplicateCommand } from '../utils/useCampaignBlockDuplicateCommand'
import { useCampaignBlockOrderCommand } from '../utils/useCampaignBlockOrderCommand'
import { useCampaignRegionCommand } from '../utils/useCampaignRegionCommand'

import { Breadcrumb } from './Breadcrumb'

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

/** Where "+Add section" puts the new section: a page and a position among its sections. */
interface SectionInsert {
  pageId: string
  parentOrder: number
}

/**
 * The one contextual bottom bar: the breadcrumb, then the controls for what
 * is selected. Campaign row: Settings, Theme, Languages, Translations, +Add
 * section. Section: Edit, Style, +Add (an Extra, or a section above or
 * below), move up/down, duplicate, bin behind a confirmation. Chrome: Edit,
 * Style, +Add only. Text Extra: size, align, colour, Style, bin. Button Extra
 * adds the link chip and variant/size/colours. Region card: Open page, +Add
 * line, Settings, list/unlist and move. On an Orphan Page the campaign row
 * adds the orphan page bar. Controls that belong to later tickets render
 * disabled.
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
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [styleOpen, setStyleOpen] = useState(false)

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

  function handleEdit(): void {
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
    addBlock({
      block,
      execute() {
        void sectionCreate(block, { id, campaignId: campaign.id, ...insert })
      }
    })
  }

  function handleMove(step: -1 | 1): void {
    if (selectedSection?.parentOrder == null) return
    addBlockOrder(selectedSection, selectedSection.parentOrder + step)
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
      {sectionTypesForPage(sectionMenuPageKind).map((typename) => (
        <MenuItem key={typename} onClick={() => handleAddSection(typename)}>
          {blockLabel(t, typename)}
        </MenuItem>
      ))}
    </Menu>
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
            <Chip
              icon={<LinkIcon />}
              label={t('Add link')}
              variant="outlined"
              disabled
            />
            {selection.block?.__typename === 'CampaignButtonBlock' && (
              <ButtonControls block={selection.block} />
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
      <SectionDeleteDialog
        open={deleteOpen && selectedSection != null}
        pageKind={
          selectedSection != null
            ? (pageKindOf(selectedSection) ?? pageKind)
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
    </Stack>
  )
}
