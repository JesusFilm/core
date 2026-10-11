import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement, useState } from 'react'

import {
  CampaignStringKey,
  JourneyStatus
} from '../../../../__generated__/globalTypes'
import { useCampaign } from '../CampaignProvider'
import { CampaignSectionBand } from '../CampaignSectionBand'
import { CampaignSectionHeading } from '../CampaignSectionHeading'
import { hasText } from '../types'
import type { CampaignPublic, CampaignRegion, CampaignTreeOf } from '../types'

export type CampaignShareLanguage = CampaignRegion['languages'][number]

interface CampaignRegionShareProps {
  block: CampaignTreeOf<'CampaignRegionShareBlock'>
}

/**
 * The Share Languages the public selector offers: only those whose linked
 * journey is live-published, in `CampaignRegionLanguage` order. An Unlinked
 * Language is never shown to visitors.
 */
export function shareLanguages(
  region: Pick<CampaignRegion, 'languages'>
): CampaignShareLanguage[] {
  return region.languages
    .filter((language) => language.journeyStatus === JourneyStatus.published)
    .sort((a, b) => a.order - b.order)
}

/**
 * The language the selector opens on: the visitor's Page Language when the
 * region has a journey in it, else the region's first.
 */
export function defaultShareLanguage(
  languages: CampaignShareLanguage[],
  pageLanguageId: string
): CampaignShareLanguage | undefined {
  return (
    languages.find((language) => language.languageId === pageLanguageId) ??
    languages[0]
  )
}

/** The public selector label: the language's autonym from api-languages, else its id. */
export function shareLanguageLabel(language: CampaignShareLanguage): string {
  return language.language.name[0]?.value ?? language.languageId
}

/** A Campaign String's resolved value, empty when the campaign lacks the row. */
export function campaignString(
  campaign: Pick<CampaignPublic, 'strings'>,
  key: CampaignStringKey
): string {
  return campaign.strings.find((string) => string.key === key)?.value ?? ''
}

/**
 * The Region Share section: title and intro, then the Share Language
 * selector listing only languages with a live-published journey, opening on
 * the visitor's Page Language when the region has a journey in it, else the
 * region's first. With no linked language the section is title and intro
 * only. The phone frame, Share Link and QR code are the next ticket's.
 */
export function CampaignRegionShare({
  block
}: CampaignRegionShareProps): ReactElement {
  const { campaign, region } = useCampaign()
  const [selectedId, setSelectedId] = useState<string>()
  const languages = region == null ? [] : shareLanguages(region)
  const selected =
    languages.find((language) => language.id === selectedId) ??
    defaultShareLanguage(languages, campaign.languageId)
  const step1 = campaignString(campaign, CampaignStringKey.step1)

  function handleChange(event: SelectChangeEvent<string>): void {
    setSelectedId(event.target.value)
  }

  return (
    <CampaignSectionBand block={block}>
      <CampaignSectionHeading title={block.title} />
      {hasText(block.intro) && (
        <Typography
          variant="body1"
          data-testid="CampaignRegionShareIntro"
          sx={{ color: 'var(--campaign-band-muted)', maxWidth: 720 }}
        >
          {block.intro}
        </Typography>
      )}
      {selected != null && (
        <Stack
          spacing={2}
          data-testid="CampaignRegionShareLanguages"
          sx={{ alignItems: 'flex-start', width: '100%' }}
        >
          {hasText(step1) && (
            <Typography
              variant="subtitle1"
              component="p"
              id={`${block.id}-step1`}
              sx={{ color: 'var(--campaign-band-heading)' }}
            >
              {step1}
            </Typography>
          )}
          <FormControl sx={{ minWidth: 240 }}>
            <Select<string>
              value={selected.id}
              onChange={handleChange}
              data-testid="CampaignRegionShareSelect"
              inputProps={{
                'aria-label': hasText(step1) ? step1 : undefined,
                'aria-labelledby': hasText(step1)
                  ? `${block.id}-step1`
                  : undefined
              }}
              sx={{
                color: 'var(--campaign-band-text)',
                backgroundColor: 'var(--campaign-band-card)',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'var(--campaign-band-border)'
                }
              }}
            >
              {languages.map((language) => (
                <MenuItem
                  key={language.id}
                  value={language.id}
                  lang={language.language.bcp47 ?? undefined}
                >
                  {shareLanguageLabel(language)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      )}
    </CampaignSectionBand>
  )
}
