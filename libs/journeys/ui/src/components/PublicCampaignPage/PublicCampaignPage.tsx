import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, ReactNode } from 'react'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { CampaignCountryViews } from './CampaignCountryViews'
import { CampaignHero } from './CampaignHero'
import { CampaignMediaSection } from './CampaignMediaSection'
import { CampaignSharePanel } from './CampaignSharePanel'
import { CampaignTemplatesSection } from './CampaignTemplatesSection'
import {
  CAMPAIGN_BG,
  CAMPAIGN_TEXT,
  CAMPAIGN_TEXT_MUTED,
  PublicCampaignPageData
} from './campaignTokens'

/** Re-export the leaf so consumers import tokens/types from the entry point. */
export * from './campaignTokens'

/**
 * Which surface the page renders for:
 * - `journey` — the real full-screen page in the journeys app
 * - `admin`   — the compact, read-only recreation in the admin builder
 */
export type PublicCampaignPageVariant = 'journey' | 'admin'

interface PublicCampaignPageProps {
  data: PublicCampaignPageData
  variant?: PublicCampaignPageVariant
  /**
   * Admin-only: custom renderer for the media section (the builder previews
   * in-progress form state the public renderer can't). Ignored by the
   * journey variant, which renders `data.media` itself.
   */
  mediaSlot?: ReactNode
}

/**
 * Public campaign landing page, shared by the live journeys app and the admin
 * builder preview. Paints its own dark theme (nested website/dark MUI theme +
 * explicit background) so it renders identically under any host theme.
 */
export function PublicCampaignPage({
  data,
  variant = 'journey',
  mediaSlot
}: PublicCampaignPageProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  const decorative = variant === 'admin'

  return (
    <ThemeProvider
      themeName={ThemeName.website}
      themeMode={ThemeMode.dark}
      nested
    >
      <Box
        data-testid={
          decorative ? 'PublicCampaignPageAdminView' : 'PublicCampaignPage'
        }
        // The admin variant is a decorative preview of fields the form already
        // announces; hide the duplicate subtree from assistive tech.
        aria-hidden={decorative ? 'true' : undefined}
        sx={{
          width: '100%',
          minHeight: decorative ? undefined : '100dvh',
          backgroundColor: CAMPAIGN_BG,
          color: CAMPAIGN_TEXT
        }}
      >
        <CampaignHero data={data} decorative={decorative} />
        <Container
          maxWidth="lg"
          disableGutters={decorative}
          sx={{ px: decorative ? 2 : { xs: 2.5, sm: 5 }, pb: 8 }}
        >
          <Stack spacing={decorative ? 6 : { xs: 8, md: 12 }}>
            <CampaignSharePanel
              journeys={data.shareJourneys}
              publicOrigin={data.publicOrigin}
              decorative={decorative}
            />
            <CampaignMediaSection
              media={decorative ? null : data.media}
              mediaSlot={decorative ? mediaSlot : undefined}
            />
            <CampaignTemplatesSection
              templates={data.templates}
              decorative={decorative}
            />
            {data.countryStats !== undefined && (
              <CampaignCountryViews
                stats={data.countryStats}
                decorative={decorative}
              />
            )}
          </Stack>
        </Container>
        <Box
          component="footer"
          sx={{ py: 4, textAlign: 'center', color: CAMPAIGN_TEXT_MUTED }}
        >
          <Typography variant="body2">{t('Made with NextSteps')}</Typography>
        </Box>
      </Box>
    </ThemeProvider>
  )
}
