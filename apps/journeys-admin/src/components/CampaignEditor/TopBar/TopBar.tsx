import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next/pages'
import { useSnackbar } from 'notistack'
import { ReactElement, useState } from 'react'

import ChevronLeftIcon from '@core/shared/ui/icons/ChevronLeft'
import ComputerIcon from '@core/shared/ui/icons/Computer'
import FlexAlignBottom1Icon from '@core/shared/ui/icons/FlexAlignBottom1'
import Iphone1Icon from '@core/shared/ui/icons/Iphone1'
import Layout2Icon from '@core/shared/ui/icons/Layout2'
import LinkExternalIcon from '@core/shared/ui/icons/LinkExternal'
import SquareIcon from '@core/shared/ui/icons/Square'

import {
  GetCampaign_campaign as Campaign,
  GetCampaign_campaign_regions as CampaignRegion
} from '../../../../__generated__/GetCampaign'
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
import { regionNeedsJourney, sortedRegions } from '../CampaignEditorProvider'
import type { CanvasView } from '../Canvas'
import type { EditorPanelMode } from '../EditorPanel'

import { UnpublishDialog } from './UnpublishDialog'

interface TopBarProps {
  campaign: Campaign
  pageKind: CampaignPageKind
  /** The region the Region Page is rendered for; undefined on the landing page or with no regions. */
  regionId?: string
  onPageKindChange: (pageKind: CampaignPageKind, regionId?: string) => void
  previewLanguageId: string
  onPreviewLanguageChange: (languageId: string) => void
  view: CanvasView
  onViewChange: (view: CanvasView) => void
  /** Publish and Unpublish are campaign Manage: a manager of the team only. */
  isManager: boolean
  /** Where the editor's panels show: docked beside the canvas, or floating over it. */
  panelMode: EditorPanelMode
  onPanelModeChange: (mode: EditorPanelMode) => void
}

/** The page selector's value: the landing page, or the Region Page rendered for one region. */
export function pageSelectValue(
  pageKind: CampaignPageKind,
  regionId?: string
): string {
  if (pageKind === CampaignPageKind.landing) return CampaignPageKind.landing
  return regionId == null
    ? CampaignPageKind.regionTemplate
    : `region:${regionId}`
}

/** The page selector entry for a region: its name, with " · not listed" for an orphan. */
export function regionPageLabel(
  t: (key: string, options?: Record<string, unknown>) => string,
  region: Pick<CampaignRegion, 'name' | 'listed'>
): string {
  return region.listed
    ? region.name
    : t('{{name}} · not listed', { name: region.name })
}

function languageLabel(language: Campaign['languages'][number]): string {
  const primary = language.language.name.find((name) => name.primary)
  return (
    primary?.value ?? language.language.name[0]?.value ?? language.languageId
  )
}

/**
 * The editor's top bar: back to the campaign list, page selector, preview
 * language, Desktop/Phone,
 * undo/redo, Open page, Publish/Unpublish and the status chip. Nothing here
 * replaces Save: there is no Save button, no Unsaved chip and no save
 * indicator; publish and unpublish are explicit actions, never Commands.
 */
export function TopBar({
  campaign,
  pageKind,
  regionId,
  onPageKindChange,
  previewLanguageId,
  onPreviewLanguageChange,
  view,
  onViewChange,
  panelMode,
  onPanelModeChange,
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
  const regions = sortedRegions(campaign.regions)
  const currentRegion = regions.find((region) => region.id === regionId)
  const openPageHref =
    pageKind === CampaignPageKind.regionTemplate && currentRegion != null
      ? `${campaignPermanentAddress(campaign.slug)}/${currentRegion.slug}`
      : campaignPermanentAddress(campaign.slug)

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

  function handlePageChange(event: SelectChangeEvent<string>): void {
    const value = event.target.value
    if (value === CampaignPageKind.landing) {
      onPageKindChange(CampaignPageKind.landing)
      return
    }
    onPageKindChange(
      CampaignPageKind.regionTemplate,
      value.startsWith('region:') ? value.slice('region:'.length) : undefined
    )
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

  function handlePanelModeChange(
    _event: unknown,
    nextMode: EditorPanelMode | null
  ): void {
    if (nextMode != null) onPanelModeChange(nextMode)
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
      <Tooltip title={t('All campaigns')} placement="bottom" arrow>
        <IconButton
          component={NextLink}
          href="/campaigns"
          aria-label={t('All campaigns')}
          data-testid="CampaignBackButton"
          edge="start"
        >
          <ChevronLeftIcon />
        </IconButton>
      </Tooltip>
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
          value={pageSelectValue(pageKind, currentRegion?.id)}
          onChange={handlePageChange}
          inputProps={{ 'aria-label': t('Page') }}
          data-testid="CampaignPageSelect"
        >
          <MenuItem value={CampaignPageKind.landing}>
            {t('Landing page')}
          </MenuItem>
          {regions.length === 0 && (
            <MenuItem value={CampaignPageKind.regionTemplate}>
              {t('Region page')}
            </MenuItem>
          )}
          {regions.map((region) => (
            <MenuItem key={region.id} value={`region:${region.id}`}>
              {regionPageLabel(t, region)}
              {regionNeedsJourney(region) && (
                <Chip
                  size="small"
                  color="warning"
                  label={t('Needs journey')}
                  data-testid="RegionNeedsJourney"
                  sx={{ ml: 1 }}
                />
              )}
            </MenuItem>
          ))}
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
      <ToggleButtonGroup
        exclusive
        size="small"
        value={panelMode}
        onChange={handlePanelModeChange}
        aria-label={t('Panel layout')}
        data-testid="CampaignPanelModeToggle"
      >
        <ToggleButton value="docked" aria-label={t('Docked panels')}>
          <Tooltip title={t('Docked panels')} placement="bottom" arrow>
            <Layout2Icon />
          </Tooltip>
        </ToggleButton>
        <ToggleButton value="floating" aria-label={t('Floating panels')}>
          <Tooltip title={t('Floating panels')} placement="bottom" arrow>
            <SquareIcon />
          </Tooltip>
        </ToggleButton>
        <ToggleButton value="bottom" aria-label={t('Bottom bar')}>
          <Tooltip title={t('Bottom bar')} placement="bottom" arrow>
            <FlexAlignBottom1Icon />
          </Tooltip>
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
        href={openPageHref}
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
