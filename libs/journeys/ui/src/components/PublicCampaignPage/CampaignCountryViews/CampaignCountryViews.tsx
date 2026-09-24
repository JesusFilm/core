import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { CampaignSectionLabel } from '../CampaignSectionLabel'
import {
  CAMPAIGN_ACCENT,
  CAMPAIGN_BORDER,
  CAMPAIGN_SECTION_IDS,
  CAMPAIGN_SURFACE,
  CAMPAIGN_TEXT,
  CAMPAIGN_TEXT_MUTED,
  COUNTRY_VIEWS_LIMIT,
  PublicCampaignCountryStats,
  formatViews
} from '../campaignTokens'

interface CampaignCountryViewsProps {
  /** Null renders the "unavailable" state. */
  stats: PublicCampaignCountryStats | null
  decorative?: boolean
}

function StatTile({
  label,
  value
}: {
  label: string
  value: string
}): ReactElement {
  return (
    <Stack
      spacing={0.5}
      sx={{
        flex: 1,
        p: 2.5,
        borderRadius: 3,
        backgroundColor: CAMPAIGN_SURFACE,
        border: `1px solid ${CAMPAIGN_BORDER}`
      }}
    >
      <Typography
        variant="overline"
        sx={{ color: CAMPAIGN_TEXT_MUTED, letterSpacing: '0.2em' }}
      >
        {label}
      </Typography>
      <Typography
        sx={{ color: CAMPAIGN_TEXT, fontWeight: 800, fontSize: '1.75rem' }}
      >
        {value}
      </Typography>
    </Stack>
  )
}

/** "Country views" section: top country, total views, ranked top-10 list. */
export function CampaignCountryViews({
  stats,
  decorative = false
}: CampaignCountryViewsProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  const rows = stats?.countries.slice(0, COUNTRY_VIEWS_LIMIT) ?? []
  const top = rows[0]

  return (
    <Box
      component="section"
      id={CAMPAIGN_SECTION_IDS.countries}
      data-testid="CampaignCountryViews"
    >
      <CampaignSectionLabel>{t('Country views')}</CampaignSectionLabel>
      <Typography
        component="h2"
        sx={{
          color: CAMPAIGN_TEXT,
          fontWeight: 800,
          fontSize: decorative ? '1.5rem' : { xs: '1.75rem', md: '2.25rem' },
          mb: 4
        }}
      >
        {t('Where people are watching')}
      </Typography>
      {stats == null ? (
        <Typography sx={{ color: CAMPAIGN_TEXT_MUTED }}>
          {t('View counts are unavailable right now. Check back soon.')}
        </Typography>
      ) : (
        <Stack spacing={3}>
          <Stack
            direction={decorative ? 'column' : { xs: 'column', sm: 'row' }}
            spacing={2}
          >
            <StatTile
              label={t('Top country')}
              value={top?.countryName ?? top?.countryCode ?? '—'}
            />
            <StatTile
              label={t('Total views')}
              value={formatViews(stats.totalVisitors)}
            />
          </Stack>
          {rows.length > 0 ? (
            <Stack
              component="ol"
              data-testid="CampaignCountryViewsList"
              sx={{ listStyle: 'none', m: 0, p: 0 }}
            >
              {rows.map((row, index) => (
                <Stack
                  component="li"
                  key={row.countryCode}
                  direction="row"
                  spacing={2}
                  sx={{
                    alignItems: 'center',
                    py: 1.5,
                    borderBottom: `1px solid ${CAMPAIGN_BORDER}`
                  }}
                >
                  <Typography
                    sx={{
                      color: CAMPAIGN_ACCENT,
                      fontWeight: 700,
                      minWidth: 32,
                      fontVariantNumeric: 'tabular-nums'
                    }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </Typography>
                  <Typography sx={{ color: CAMPAIGN_TEXT, flex: 1 }}>
                    {row.countryName ?? row.countryCode}
                  </Typography>
                  <Typography
                    sx={{
                      color: CAMPAIGN_TEXT,
                      fontWeight: 700,
                      fontVariantNumeric: 'tabular-nums'
                    }}
                  >
                    {formatViews(row.visitors)}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          ) : (
            <Typography sx={{ color: CAMPAIGN_TEXT_MUTED }}>
              {t('No views yet — share a link to get started.')}
            </Typography>
          )}
        </Stack>
      )}
    </Box>
  )
}
