import Divider from '@mui/material/Divider'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next/pages'
import { MouseEvent, ReactElement, ReactNode, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import Globe1Icon from '@core/shared/ui/icons/Globe1'
import Plus2Icon from '@core/shared/ui/icons/Plus2'
import TranslateIcon from '@core/shared/ui/icons/Translate'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../__generated__/GetCampaign'
import { CampaignChildPlacement } from '../../../../__generated__/globalTypes'
import { useCampaignButtonBlockCreateMutation } from '../../../libs/useCampaignButtonBlockCreateMutation'
import { CampaignSectionTypename } from '../../../libs/useCampaignSectionCreateMutation'
import { useCampaignTypographyBlockCreateMutation } from '../../../libs/useCampaignTypographyBlockCreateMutation'
import { BarButton } from '../BarButton'
import { blockLabel } from '../blockLabel'
import { Breadcrumb } from '../Breadcrumb'
import { regionLines, useCampaignEditor } from '../CampaignEditorProvider'
import { OrphanPageBar } from '../OrphanPageBar'
import {
  pageSections,
  sectionTypesForPage,
  sectionTypesForSlot
} from '../sectionTypes'
import { useAddSection } from '../utils/useAddSection'
import type { SectionInsert } from '../utils/useAddSection'
import { useCampaignBlockCreateCommand } from '../utils/useCampaignBlockCreateCommand'

/** The label a new button Extra is born with (PRD §14); campaign content, not UI copy. */
export const NEW_BUTTON_LABEL = 'Button'

interface BottomBarProps {
  /** Opens the Languages view (add and remove campaign languages) in the Inspector. */
  onLanguagesClick?: () => void
  /** Opens the Translations view (review and edit translated text) in the Inspector. */
  onTranslationsClick?: () => void
}

type ExtraTypename = 'CampaignTypographyBlock' | 'CampaignButtonBlock'

/**
 * The contextual bottom bar: the breadcrumb, then the Add menus. What the
 * selection can be edited with lives in the Inspector. Campaign row: the
 * Languages and Translations buttons until the Localize panel lands, and
 * +Add section; on an Orphan Page also the orphan page bar. Section and
 * chrome: +Add (an Extra, or for a section a section above or below). Column
 * child: +Add (Extras only). Region card: +Add line.
 */
export function BottomBar({
  onLanguagesClick,
  onTranslationsClick
}: BottomBarProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    campaign,
    selection,
    currentRegion,
    state: { pageKind }
  } = useCampaignEditor()
  const { addBlock } = useCampaignBlockCreateCommand()
  const addSection = useAddSection()
  const [typographyCreate] = useCampaignTypographyBlockCreateMutation(
    campaign.id
  )
  const [buttonCreate] = useCampaignButtonBlockCreateMutation(campaign.id)
  const [addAnchor, setAddAnchor] = useState<HTMLElement | null>(null)
  const [sectionMenu, setSectionMenu] = useState<{
    anchor: HTMLElement
    insert: SectionInsert
  } | null>(null)

  const selectedSection =
    selection.kind === 'section' ? selection.block : undefined

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
    addSection(typename, insert)
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

  function renderControls(): ReactNode {
    switch (selection.kind) {
      case 'campaign':
        return (
          <>
            {currentRegion != null && !currentRegion.listed && (
              <OrphanPageBar region={currentRegion} />
            )}
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
      case 'column':
      case 'chrome':
        return addButton
      case 'region':
        return selection.region == null ? null : (
          <BarButton
            label={t('Add line')}
            icon={<Plus2Icon />}
            onClick={handleAddLine}
          />
        )
      default:
        return null
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
    </Stack>
  )
}
