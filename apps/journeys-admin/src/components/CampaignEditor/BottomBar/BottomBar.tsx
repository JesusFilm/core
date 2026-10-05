import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next/pages'
import { MouseEvent, ReactElement, ReactNode, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import AlignCenterIcon from '@core/shared/ui/icons/AlignCenter'
import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'
import ChevronUpIcon from '@core/shared/ui/icons/ChevronUp'
import CopyLeftIcon from '@core/shared/ui/icons/CopyLeft'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import LinkIcon from '@core/shared/ui/icons/Link'
import PaletteIcon from '@core/shared/ui/icons/Palette'
import Plus2Icon from '@core/shared/ui/icons/Plus2'
import SettingsIcon from '@core/shared/ui/icons/Settings'
import TranslateIcon from '@core/shared/ui/icons/Translate'
import Trash2Icon from '@core/shared/ui/icons/Trash2'
import Type1Icon from '@core/shared/ui/icons/Type1'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../__generated__/GetCampaign'
import { CampaignChildPlacement } from '../../../../__generated__/globalTypes'
import { useCampaignButtonBlockCreateMutation } from '../../../libs/useCampaignButtonBlockCreateMutation'
import { useCampaignTypographyBlockCreateMutation } from '../../../libs/useCampaignTypographyBlockCreateMutation'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { useCampaignBlockCreateCommand } from '../utils/useCampaignBlockCreateCommand'
import { useCampaignBlockDeleteCommand } from '../utils/useCampaignBlockDeleteCommand'

import { Breadcrumb } from './Breadcrumb'

/** The label a new button Extra is born with (PRD §14); campaign content, not UI copy. */
export const NEW_BUTTON_LABEL = 'Button'

interface BottomBarProps {
  onSettingsClick: () => void
}

interface BarButtonProps {
  label: string
  icon: ReactNode
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
}

function BarButton({
  label,
  icon,
  onClick,
  disabled = false
}: BarButtonProps): ReactElement {
  return (
    <Button
      variant="outlined"
      color="secondary"
      startIcon={icon}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </Button>
  )
}

type ExtraTypename = 'CampaignTypographyBlock' | 'CampaignButtonBlock'

/**
 * The one contextual bottom bar: the breadcrumb, then the controls for what
 * is selected. Campaign row: Settings, Theme, Translations, +Add section.
 * Section: Edit, Style, +Add, move/duplicate, bin. Chrome: Edit, Style, +Add.
 * Text Extra: size, align, colour, Style, bin. Button Extra adds the link
 * chip and variant/size/colours. Controls that belong to later tickets
 * render disabled.
 */
export function BottomBar({ onSettingsClick }: BottomBarProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { campaign, selection, dispatch } = useCampaignEditor()
  const { addBlock } = useCampaignBlockCreateCommand()
  const { addBlockDelete } = useCampaignBlockDeleteCommand()
  const [typographyCreate] = useCampaignTypographyBlockCreateMutation(
    campaign.id
  )
  const [buttonCreate] = useCampaignButtonBlockCreateMutation(campaign.id)
  const [addAnchor, setAddAnchor] = useState<HTMLElement | null>(null)

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

  function handleDelete(): void {
    if (selection.block == null) return
    addBlockDelete(selection.block)
  }

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
      </Menu>
    </>
  )

  const styleButton = (
    <BarButton label={t('Style')} icon={<PaletteIcon />} disabled />
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
            <BarButton
              label={t('Settings')}
              icon={<SettingsIcon />}
              onClick={onSettingsClick}
            />
            <BarButton label={t('Theme')} icon={<PaletteIcon />} disabled />
            <BarButton
              label={t('Translations')}
              icon={<TranslateIcon />}
              disabled
            />
            <BarButton label={t('Add section')} icon={<Plus2Icon />} disabled />
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
            <IconButton aria-label={t('Move up')} disabled>
              <ChevronUpIcon />
            </IconButton>
            <IconButton aria-label={t('Move down')} disabled>
              <ChevronDownIcon />
            </IconButton>
            <IconButton aria-label={t('Duplicate')} disabled>
              <CopyLeftIcon />
            </IconButton>
            <IconButton aria-label={t('Delete')} disabled>
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
      case 'text':
        return (
          <>
            <BarButton label={t('Size')} icon={<Type1Icon />} disabled />
            <BarButton label={t('Align')} icon={<AlignCenterIcon />} disabled />
            <BarButton label={t('Colour')} icon={<PaletteIcon />} disabled />
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
            <BarButton label={t('Variant')} icon={<Type1Icon />} disabled />
            <BarButton label={t('Size')} icon={<Type1Icon />} disabled />
            <BarButton label={t('Colours')} icon={<PaletteIcon />} disabled />
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
    </Stack>
  )
}
