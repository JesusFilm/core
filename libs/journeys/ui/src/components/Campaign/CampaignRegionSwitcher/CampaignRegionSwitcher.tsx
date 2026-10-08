import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { CampaignSwitcherVariant } from '../../../../__generated__/globalTypes'
import { campaignPageHref, useCampaign } from '../CampaignProvider'
import { CampaignSectionBand } from '../CampaignSectionBand'
import { CampaignSectionHeading } from '../CampaignSectionHeading'
import { CampaignTypography } from '../CampaignTypography'
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

/** The chip label for a Region Country: the owner's primary name, else the id. */
export function countryLabel(
  country: CampaignRegion['countries'][number]
): string {
  return country.country.name[0]?.value ?? country.countryId
}

const LAYOUT: Record<CampaignSwitcherVariant, Record<string, unknown>> = {
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
  const pill = variant === CampaignSwitcherVariant.pills
  const list = variant === CampaignSwitcherVariant.list
  return (
    <ButtonBase
      href={href}
      data-testid={`CampaignRegionCard-${region.id}`}
      sx={{
        display: 'flex',
        flexDirection: list ? { xs: 'column', md: 'row' } : 'column',
        alignItems: list ? { xs: 'flex-start', md: 'center' } : 'flex-start',
        gap: pill ? 1 : list ? 2 : 0.5,
        px: pill ? 2 : 3,
        py: pill ? 1 : 3,
        borderRadius: pill ? 999 : 1,
        textAlign: 'left',
        backgroundColor: 'var(--campaign-band-card)',
        border: '1px solid var(--campaign-band-border)'
      }}
    >
      <Typography
        variant={pill ? 'subtitle1' : 'h5'}
        component="span"
        data-testid="CampaignRegionCardName"
        sx={{ color: 'var(--campaign-band-heading)' }}
      >
        {region.name}
      </Typography>
      {!pill && (
        <Stack
          component="span"
          spacing={0.5}
          sx={{ flexGrow: list ? 1 : 0, alignItems: 'flex-start' }}
        >
          {region.lines.map((line) =>
            line.__typename === 'CampaignTypographyBlock' ? (
              <CampaignTypography key={line.id} block={line} />
            ) : null
          )}
        </Stack>
      )}
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
  const { campaign, basePath, region: current } = useCampaign()
  const regions = switcherRegions(campaign.regions, current)
  const variant = block.switcherVariant ?? CampaignSwitcherVariant.cards

  return (
    <CampaignSectionBand block={block}>
      <CampaignSectionHeading title={block.title} />
      <Box
        data-testid="CampaignRegionSwitcherGrid"
        data-variant={variant}
        sx={LAYOUT[variant]}
      >
        {regions.map((region) => (
          <CampaignRegionCard
            key={region.id}
            region={region}
            variant={variant}
            href={campaignPageHref(`${basePath}/${region.slug}`, campaign)}
          />
        ))}
      </Box>
    </CampaignSectionBand>
  )
}
