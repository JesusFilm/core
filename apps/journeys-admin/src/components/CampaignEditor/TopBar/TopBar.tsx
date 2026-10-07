import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import ComputerIcon from '@core/shared/ui/icons/Computer'
import Iphone1Icon from '@core/shared/ui/icons/Iphone1'
import LinkExternalIcon from '@core/shared/ui/icons/LinkExternal'

import { GetCampaign_campaign as Campaign } from '../../../../__generated__/GetCampaign'
import {
  CampaignPageKind,
  CampaignStatus
} from '../../../../__generated__/globalTypes'
import { useCampaignPublishMutation } from '../../../libs/useCampaignPublishMutation'
import { useCampaignUnpublishMutation } from '../../../libs/useCampaignUnpublishMutation'
import { CommandRedoItem } from '../../Editor/Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../Editor/Toolbar/Items/CommandUndoItem'
import { Item } from '../../Editor/Toolbar/Items/Item/Item'
import { LabelChip } from '../../LabelChip'
import { campaignPermanentAddress } from '../campaignAddress'
import type { CanvasView } from '../Canvas'

import { UnpublishDialog } from './UnpublishDialog'

interface TopBarProps {
  campaign: Campaign
  pageKind: CampaignPageKind
  onPageKindChange: (pageKind: CampaignPageKind) => void
  previewLanguageId: string
  onPreviewLanguageChange: (languageId: string) => void
  view: CanvasView
  onViewChange: (view: CanvasView) => void
  /** Publish and Unpublish are campaign Manage: a manager of the team only. */
  isManager: boolean
}

function languageLabel(language: Campaign['languages'][number]): string {
  const primary = language.language.name.find((name) => name.primary)
  return (
    primary?.value ?? language.language.name[0]?.value ?? language.languageId
  )
}

/**
 * The editor's top bar: page selector, preview language, Desktop/Phone,
 * undo/redo, Open page, Publish/Unpublish and the status chip. Nothing here
 * replaces Save: there is no Save button, no Unsaved chip and no save
 * indicator; publish and unpublish are explicit actions, never Commands.
 */
export function TopBar({
  campaign,
  pageKind,
  onPageKindChange,
  previewLanguageId,
  onPreviewLanguageChange,
  view,
  onViewChange,
  isManager
}: TopBarProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const [unpublishOpen, setUnpublishOpen] = useState(false)
  const [campaignPublish, { loading: publishing }] =
    useCampaignPublishMutation()
  const [campaignUnpublish, { loading: unpublishing }] =
    useCampaignUnpublishMutation()
  const published = campaign.status === CampaignStatus.published

  function showError(error: unknown, fallback: string): void {
    enqueueSnackbar(error instanceof Error ? error.message : fallback, {
      variant: 'error',
      preventDuplicate: true
    })
  }

  async function handlePublish(): Promise<void> {
    try {
      await campaignPublish({ variables: { id: campaign.id } })
    } catch (error) {
      showError(error, t('Could not publish campaign'))
    }
  }

  async function handleUnpublish(): Promise<void> {
    setUnpublishOpen(false)
    try {
      await campaignUnpublish({ variables: { id: campaign.id } })
    } catch (error) {
      showError(error, t('Could not unpublish campaign'))
    }
  }

  function handlePageChange(event: SelectChangeEvent<CampaignPageKind>): void {
    onPageKindChange(event.target.value)
  }

  function handleLanguageChange(event: SelectChangeEvent<string>): void {
    onPreviewLanguageChange(event.target.value)
  }

  function handleViewChange(
    _event: unknown,
    nextView: CanvasView | null
  ): void {
    if (nextView != null) onViewChange(nextView)
  }

  return (
    <Stack
      direction="row"
      spacing={3}
      data-testid="CampaignTopBar"
      sx={{
        px: 4,
        py: 2,
        alignItems: 'center',
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper'
      }}
    >
      <Typography
        variant="subtitle1"
        noWrap
        sx={{ fontWeight: 'bold', maxWidth: 240 }}
      >
        {campaign.title}
      </Typography>
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel id="campaign-page-select-label">{t('Page')}</InputLabel>
        <Select
          labelId="campaign-page-select-label"
          label={t('Page')}
          value={pageKind}
          onChange={handlePageChange}
          inputProps={{ 'aria-label': t('Page') }}
          data-testid="CampaignPageSelect"
        >
          <MenuItem value={CampaignPageKind.landing}>
            {t('Landing page')}
          </MenuItem>
          <MenuItem value={CampaignPageKind.regionTemplate}>
            {t('Region page')}
          </MenuItem>
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel id="campaign-language-select-label">
          {t('Preview language')}
        </InputLabel>
        <Select
          labelId="campaign-language-select-label"
          label={t('Preview language')}
          value={previewLanguageId}
          onChange={handleLanguageChange}
          inputProps={{ 'aria-label': t('Preview language') }}
          data-testid="CampaignLanguageSelect"
        >
          {campaign.languages.map((language) => (
            <MenuItem key={language.id} value={language.languageId}>
              {languageLabel(language)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={view}
        onChange={handleViewChange}
        aria-label={t('Preview size')}
      >
        <ToggleButton value="desktop" aria-label={t('Desktop')}>
          <ComputerIcon />
        </ToggleButton>
        <ToggleButton value="phone" aria-label={t('Phone')}>
          <Iphone1Icon />
        </ToggleButton>
      </ToggleButtonGroup>
      <Stack direction="row" sx={{ flexGrow: 1, justifyContent: 'center' }}>
        <CommandUndoItem variant="icon-button" />
        <CommandRedoItem variant="icon-button" />
      </Stack>
      <Item
        variant="icon-button"
        label={t('Open page')}
        icon={<LinkExternalIcon />}
        href={campaignPermanentAddress(campaign.slug)}
      />
      <Divider orientation="vertical" flexItem />
      {published ? (
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => setUnpublishOpen(true)}
          disabled={!isManager || unpublishing}
        >
          {t('Unpublish')}
        </Button>
      ) : (
        <Button
          variant="contained"
          onClick={handlePublish}
          disabled={!isManager || publishing}
        >
          {t('Publish')}
        </Button>
      )}
      <LabelChip
        color={published ? 'success' : 'default'}
        label={published ? t('Published') : t('Draft')}
        data-testid="CampaignStatusChip"
      />
      <UnpublishDialog
        open={unpublishOpen}
        onClose={() => setUnpublishOpen(false)}
        onConfirm={handleUnpublish}
      />
    </Stack>
  )
}
