import Chip from '@mui/material/Chip'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { GetCampaign_campaign_regions as CampaignRegion } from '../../../../__generated__/GetCampaign'
import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import {
  regionNeedsJourney,
  sortedRegions,
  useCampaignEditor
} from '../CampaignEditorProvider'
import { languageNames } from '../LanguagesPanel/LanguagesPanel'
import { LeftPanelBody } from '../LeftPanel'

/** The page list's selected value: the landing page, or the Region Page rendered for one region. */
export function pageSelectValue(
  pageKind: CampaignPageKind,
  regionId?: string
): string {
  if (pageKind === CampaignPageKind.landing) return CampaignPageKind.landing
  return regionId == null
    ? CampaignPageKind.regionTemplate
    : `region:${regionId}`
}

/** The page list entry for a region: its name, with " · not listed" for an orphan. */
export function regionPageLabel(
  t: (key: string, options?: Record<string, unknown>) => string,
  region: Pick<CampaignRegion, 'name' | 'listed'>
): string {
  return region.listed
    ? region.name
    : t('{{name}} · not listed', { name: region.name })
}

/**
 * The Pages panel: what the Campaign Canvas shows. The campaign title as its
 * header, the page list (the landing page, then each region's Region Page in
 * switcher order with " · not listed" for an orphan and the Needs journey
 * chip) and the Preview Language select. Choosing a page or a language is a
 * view choice, never a Command.
 */
export function PagesPanel(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    campaign,
    currentRegion,
    state: { pageKind, previewLanguageId },
    dispatch
  } = useCampaignEditor()
  const regions = sortedRegions(campaign.regions)
  const selectedPage = pageSelectValue(pageKind, currentRegion?.id)

  function handlePageClick(value: string): void {
    if (value === CampaignPageKind.landing) {
      dispatch({
        type: 'SetPageKindAction',
        pageKind: CampaignPageKind.landing
      })
      return
    }
    dispatch({
      type: 'SetPageKindAction',
      pageKind: CampaignPageKind.regionTemplate,
      regionId: value.startsWith('region:')
        ? value.slice('region:'.length)
        : undefined
    })
  }

  function handleLanguageChange(event: SelectChangeEvent<string>): void {
    dispatch({
      type: 'SetPreviewLanguageAction',
      previewLanguageId: event.target.value
    })
  }

  return (
    <LeftPanelBody spacing={3} data-testid="CampaignPagesPanel">
      <Typography variant="h6" noWrap data-testid="CampaignPagesPanelTitle">
        {campaign.title}
      </Typography>
      <List
        disablePadding
        aria-label={t('Pages')}
        data-testid="CampaignPageList"
      >
        <ListItemButton
          selected={selectedPage === CampaignPageKind.landing}
          aria-current={
            selectedPage === CampaignPageKind.landing ? 'page' : undefined
          }
          onClick={() => handlePageClick(CampaignPageKind.landing)}
        >
          <ListItemText primary={t('Landing page')} />
        </ListItemButton>
        {regions.length === 0 && (
          <ListItemButton
            selected={selectedPage === CampaignPageKind.regionTemplate}
            aria-current={
              selectedPage === CampaignPageKind.regionTemplate
                ? 'page'
                : undefined
            }
            onClick={() => handlePageClick(CampaignPageKind.regionTemplate)}
          >
            <ListItemText primary={t('Region page')} />
          </ListItemButton>
        )}
        {regions.map((region) => {
          const value = `region:${region.id}`
          return (
            <ListItemButton
              key={region.id}
              selected={selectedPage === value}
              aria-current={selectedPage === value ? 'page' : undefined}
              onClick={() => handlePageClick(value)}
            >
              <ListItemText primary={regionPageLabel(t, region)} />
              {regionNeedsJourney(region) && (
                <Chip
                  size="small"
                  color="warning"
                  label={t('Needs journey')}
                  data-testid="RegionNeedsJourney"
                  sx={{ ml: 1, flexShrink: 0 }}
                />
              )}
            </ListItemButton>
          )
        })}
      </List>
      <FormControl size="small" fullWidth>
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
              {languageNames(language).autonym}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </LeftPanelBody>
  )
}
