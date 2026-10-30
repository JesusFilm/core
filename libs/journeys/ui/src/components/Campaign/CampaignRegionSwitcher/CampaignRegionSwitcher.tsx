import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import { SxProps, Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { Children, ReactElement, ReactNode } from 'react'

import { CampaignSwitcherVariant } from '../../../../__generated__/globalTypes'
import { campaignRegionHref, useCampaign } from '../CampaignProvider'
import { regionLineTexts } from '../CampaignRegionHeader'
import { CampaignSectionBand } from '../CampaignSectionBand'
import { CampaignSectionHeading } from '../CampaignSectionHeading'
import { campaignCardSx } from '../libs/campaignSx'
import type { StyleObject } from '../libs/campaignSx'
import type { CampaignRegion, CampaignTreeOf } from '../types'

interface CampaignRegionSwitcherProps {
  block: CampaignTreeOf<'CampaignRegionSwitcherBlock'>
}

/** The regions a switcher shows: listed ones only, by `order`. */
export function listedRegions(regions: CampaignRegion[]): CampaignRegion[] {
  return regions
    .filter((region) => region.listed)
    .sort((a, b) => a.order - b.order)
}

/** The listed regions with the current one hidden on its own page. */
export function switcherRegions(
  regions: CampaignRegion[],
  current: Pick<CampaignRegion, 'id'> | null
): CampaignRegion[] {
  return listedRegions(regions).filter((region) => region.id !== current?.id)
}

/**
 * The chip label for a Region Country: the owner's name in the Page Language,
 * else its primary name, else the id. api-languages lists the primary name
 * first and the Page Language name after it (one row when they coincide).
 */
export function countryLabel(
  country: CampaignRegion['countries'][number]
): string {
  return country.country.name.at(-1)?.value ?? country.countryId
}

const LAYOUT: Record<CampaignSwitcherVariant, SxProps<Theme>> = {
  // Cards auto-fill at 230 px minimum from `md` up, one column below it.
  [CampaignSwitcherVariant.cards]: {
    display: 'grid',
    gap: 2,
    gridTemplateColumns: {
      xs: '1fr',
      md: 'repeat(auto-fill, minmax(230px, 1fr))'
    }
  },
  // One full-width row per region.
  [CampaignSwitcherVariant.list]: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1.5
  },
  // Pills wrap at every width.
  [CampaignSwitcherVariant.pills]: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 1.5
  }
}

/** The container a switcher's regions sit in, for its variant. */
export function switcherLayoutSx(
  variant: CampaignSwitcherVariant
): SxProps<Theme> {
  return LAYOUT[variant]
}

/** One region's frame, for its variant: a card, a full-width row or a pill. */
export function regionFrameSx(variant: CampaignSwitcherVariant): StyleObject {
  const pill = variant === CampaignSwitcherVariant.pills
  const list = variant === CampaignSwitcherVariant.list
  return {
    display: 'flex',
    flexDirection: list ? { xs: 'column', md: 'row' } : 'column',
    alignItems: list ? { xs: 'flex-start', md: 'center' } : 'flex-start',
    gap: pill ? 1 : list ? 2 : 0.5,
    // A pill's rounded ends eat into its sides, so its name and flags get more room than a card's content.
    px: pill ? 4 : 3,
    py: pill ? 1.5 : 3,
    ...campaignCardSx,
    borderRadius: pill ? 999 : 1,
    textAlign: 'start'
  }
}

/** The typography variant of a region's name: a subtitle in a pill, a heading otherwise. */
export function regionNameVariant(
  variant: CampaignSwitcherVariant
): 'subtitle1' | 'h5' {
  return variant === CampaignSwitcherVariant.pills ? 'subtitle1' : 'h5'
}

interface CampaignRegionLinesProps {
  variant: CampaignSwitcherVariant
  /** Show the lines in a pill too: the editor needs them there to edit. */
  showInPill?: boolean
  children: ReactNode
}

/**
 * A region's Region Lines beneath its name (a pill has none on the public
 * page). In a row they keep their width up to half of it, so a short code
 * never wraps while a long sentence wraps within its half and leaves the
 * name and the chips their room.
 */
export function CampaignRegionLines({
  variant,
  showInPill = false,
  children
}: CampaignRegionLinesProps): ReactElement | null {
  if (variant === CampaignSwitcherVariant.pills && !showInPill) return null
  if (Children.toArray(children).length === 0) return null
  return (
    <Stack
      component="span"
      spacing={0.5}
      data-testid="CampaignRegionLines"
      sx={{
        flexGrow: variant === CampaignSwitcherVariant.list ? 1 : 0,
        flexShrink: 0,
        maxWidth:
          variant === CampaignSwitcherVariant.list
            ? { xs: '100%', md: '50%' }
            : '100%',
        alignItems: 'flex-start'
      }}
    >
      {children}
    </Stack>
  )
}

interface CampaignRegionCountriesProps {
  /** Any region shape carrying its country chips; the editor's admin region fits too. */
  region: Pick<CampaignRegion, 'countries'>
  size?: 'small' | 'medium'
}

/** The region's country chips: flag and translated name from api-languages. */
export function CampaignRegionCountries({
  region,
  size = 'small'
}: CampaignRegionCountriesProps): ReactElement | null {
  const countries = [...region.countries].sort((a, b) => a.order - b.order)
  if (countries.length === 0) return null
  return (
    <Stack
      direction="row"
      component="span"
      data-testid="CampaignRegionCountries"
      sx={{ flexWrap: 'wrap', gap: 0.5 }}
    >
      {countries.map((country) => (
        <Chip
          key={country.id}
          component="span"
          size={size}
          data-testid="CampaignRegionCountry"
          avatar={
            country.country.flagPngSrc != null ? (
              <Avatar src={country.country.flagPngSrc} alt="" />
            ) : undefined
          }
          label={countryLabel(country)}
          sx={{
            color: 'var(--campaign-band-text)',
            borderColor: 'var(--campaign-band-border)'
          }}
          variant="outlined"
        />
      ))}
    </Stack>
  )
}

interface CampaignRegionCardProps {
  region: CampaignRegion
  variant: CampaignSwitcherVariant
  href: string
}

function CampaignRegionCard({
  region,
  variant,
  href
}: CampaignRegionCardProps): ReactElement {
  return (
    <ButtonBase
      href={href}
      data-testid={`CampaignRegionCard-${region.id}`}
      sx={regionFrameSx(variant)}
    >
      <Typography
        variant={regionNameVariant(variant)}
        component="span"
        data-testid="CampaignRegionCardName"
        sx={{ color: 'var(--campaign-band-heading)' }}
      >
        {region.name}
      </Typography>
      <CampaignRegionLines variant={variant}>
        {regionLineTexts(region.lines)}
      </CampaignRegionLines>
      <CampaignRegionCountries region={region} />
    </ButtonBase>
  )
}

/**
 * The Region Switcher: every listed region, by `order`, as cards, a list or
 * pills (`variant`), each with its name as heading, its Region Lines beneath
 * and its country chips with flags. The current region is hidden on its own
 * page. Skipped by the page when no region is listed.
 */
export function CampaignRegionSwitcher({
  block
}: CampaignRegionSwitcherProps): ReactElement {
  const { campaign, region: current } = useCampaign()
  const regions = switcherRegions(campaign.regions, current)
  const variant = block.switcherVariant ?? CampaignSwitcherVariant.cards

  return (
    <CampaignSectionBand block={block}>
      <CampaignSectionHeading title={block.title} />
      <Box
        data-testid="CampaignRegionSwitcherGrid"
        data-variant={variant}
        sx={switcherLayoutSx(variant)}
      >
        {regions.map((region) => (
          <CampaignRegionCard
            key={region.id}
            region={region}
            variant={variant}
            href={campaignRegionHref(campaign, region.slug)}
          />
        ))}
      </Box>
    </CampaignSectionBand>
  )
}
