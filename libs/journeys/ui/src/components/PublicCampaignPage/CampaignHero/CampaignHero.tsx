import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import {
  CAMPAIGN_ACCENT,
  CAMPAIGN_BG,
  CAMPAIGN_SECTION_IDS,
  CAMPAIGN_TEXT,
  CAMPAIGN_TEXT_MUTED,
  PublicCampaignPageData
} from '../campaignTokens'

type CampaignHeroData = Pick<
  PublicCampaignPageData,
  | 'title'
  | 'eyebrow'
  | 'tagline'
  | 'description'
  | 'backgroundImageSrc'
  | 'backgroundImageAlt'
>

interface CampaignHeroProps {
  data: CampaignHeroData
  /** Compact, non-interactive rendering for the admin preview. */
  decorative?: boolean
}

const HERO_GRADIENT = `linear-gradient(180deg, rgba(11,10,15,0.45) 0%, rgba(11,10,15,0.8) 65%, ${CAMPAIGN_BG} 100%)`

export function CampaignHero({
  data,
  decorative = false
}: CampaignHeroProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  const hasBackground =
    data.backgroundImageSrc != null && data.backgroundImageSrc !== ''
  const title = data.title !== '' ? data.title : t('Untitled campaign')

  return (
    <Box
      component="section"
      data-testid="CampaignHero"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        minHeight: decorative ? 320 : { xs: 520, md: 640 },
        px: { xs: 2.5, sm: 5 },
        py: decorative ? 6 : { xs: 10, md: 14 }
      }}
    >
      {hasBackground && (
        <Box
          component="img"
          src={data.backgroundImageSrc ?? undefined}
          alt={data.backgroundImageAlt ?? ''}
          aria-hidden="true"
          data-testid="CampaignHeroBackground"
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.6
          }}
        />
      )}
      <Box
        aria-hidden="true"
        sx={{ position: 'absolute', inset: 0, background: HERO_GRADIENT }}
      />
      <Stack
        spacing={decorative ? 1.5 : 2.5}
        sx={{ position: 'relative', maxWidth: 840, alignItems: 'center' }}
      >
        {data.eyebrow != null && data.eyebrow !== '' && (
          <Typography
            variant="overline"
            sx={{
              color: CAMPAIGN_ACCENT,
              fontWeight: 700,
              letterSpacing: '0.3em'
            }}
          >
            {data.eyebrow}
          </Typography>
        )}
        {data.tagline != null && data.tagline !== '' && (
          <Typography
            sx={{
              fontStyle: 'italic',
              color: CAMPAIGN_TEXT_MUTED,
              fontSize: decorative ? '0.95rem' : { xs: '1rem', md: '1.25rem' }
            }}
          >
            {data.tagline}
          </Typography>
        )}
        <Typography
          component="h1"
          sx={{
            color: CAMPAIGN_TEXT,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            fontSize: decorative ? '2rem' : { xs: '2.5rem', md: '4.25rem' }
          }}
        >
          {title}
        </Typography>
        {data.description !== '' && (
          <Typography
            sx={{
              color: CAMPAIGN_TEXT_MUTED,
              whiteSpace: 'pre-wrap',
              maxWidth: 640,
              fontSize: decorative ? '0.9rem' : { xs: '1rem', md: '1.125rem' }
            }}
          >
            {data.description}
          </Typography>
        )}
        {!decorative && (
          <Button
            href={`#${CAMPAIGN_SECTION_IDS.share}`}
            variant="contained"
            size="large"
            sx={{
              mt: 2,
              backgroundColor: CAMPAIGN_ACCENT,
              '&:hover': { backgroundColor: CAMPAIGN_ACCENT, opacity: 0.9 }
            }}
          >
            {t('Start sharing')}
          </Button>
        )}
      </Stack>
    </Box>
  )
}
