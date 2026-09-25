import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement, memo, useMemo } from 'react'

import {
  PublicCampaignPage,
  PublicCampaignPageData
} from '@core/journeys/ui/PublicCampaignPage'

import { GetAdminJourneys_journeys as Journey } from '../../../../__generated__/GetAdminJourneys'
import { GetCampaignCountryStats_campaign_countryStats as CountryStats } from '../../../../__generated__/GetCampaignCountryStats'
import { TemplateGalleryPageMediaType } from '../../../../__generated__/globalTypes'
import { MediaPreview } from '../../TemplateGalleryPageList/CollectionDialog/MediaPreview'
import { CampaignFormValues } from '../useCampaignForm'

interface CampaignPreviewPaneProps {
  values: CampaignFormValues
  shareJourneys: readonly Journey[]
  templateJourneys: readonly Journey[]
  countryStats: CountryStats | null
  publicOrigin: string
}

export function toPreviewData(
  values: CampaignFormValues,
  shareJourneys: readonly Journey[],
  templateJourneys: readonly Journey[],
  countryStats: CountryStats | null,
  publicOrigin: string
): PublicCampaignPageData {
  return {
    title: values.title,
    eyebrow: values.eyebrow,
    tagline: values.tagline,
    description: values.description,
    backgroundImageSrc: values.backgroundImageSrc,
    backgroundImageAlt: values.backgroundImageAlt,
    // Media renders through `mediaSlot` (form state) — not mapped here.
    media: null,
    shareJourneys: shareJourneys.map((journey) => ({
      id: journey.id,
      slug: journey.slug,
      title: journey.title,
      language: { id: journey.language.id, name: journey.language.name }
    })),
    templates: templateJourneys.map((journey) => ({
      id: journey.id,
      title: journey.title,
      description: journey.description,
      slug: journey.slug,
      customizable: journey.customizable,
      createdAt: journey.createdAt != null ? String(journey.createdAt) : null,
      languageName: journey.language.name,
      image:
        journey.primaryImageBlock != null
          ? {
              src: journey.primaryImageBlock.src,
              alt: journey.primaryImageBlock.alt
            }
          : null
    })),
    countryStats:
      countryStats != null
        ? {
            totalVisitors: countryStats.totalVisitors,
            countries: countryStats.countries.map((country) => ({
              countryCode: country.countryCode,
              countryName: country.countryName,
              visitors: country.visitors
            }))
          }
        : null,
    publicOrigin
  }
}

/** Phone-width, read-only mirror of the public page rendered from live form state. */
function CampaignPreviewPaneImpl({
  values,
  shareJourneys,
  templateJourneys,
  countryStats,
  publicOrigin
}: CampaignPreviewPaneProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const data = useMemo(
    () =>
      toPreviewData(
        values,
        shareJourneys,
        templateJourneys,
        countryStats,
        publicOrigin
      ),
    [values, shareJourneys, templateJourneys, countryStats, publicOrigin]
  )

  return (
    <Box
      data-testid="CampaignPreviewPane"
      sx={{
        bgcolor: '#efefef',
        flex: { md: '0 0 420px' },
        px: 3,
        py: 2,
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        alignItems: 'center',
        position: { md: 'sticky' },
        top: 0,
        maxHeight: { md: '100vh' },
        overflow: 'hidden'
      }}
    >
      <Typography
        variant="overline"
        sx={{ color: 'text.secondary', mb: 1, flexShrink: 0 }}
      >
        {t('Preview')}
      </Typography>
      <Box
        aria-hidden="true"
        sx={{
          width: 360,
          flex: 1,
          minHeight: 0,
          borderRadius: 3,
          overflowX: 'hidden',
          overflowY: 'auto',
          boxShadow:
            '0 6px 10px rgba(0,0,0,0.14), 0 1px 18px rgba(0,0,0,0.12), 0 3px 5px rgba(0,0,0,0.2)'
        }}
      >
        <PublicCampaignPage
          variant="admin"
          data={data}
          mediaSlot={
            values.media.type !== TemplateGalleryPageMediaType.none ? (
              <MediaPreview media={values.media} />
            ) : null
          }
        />
      </Box>
    </Box>
  )
}

export const CampaignPreviewPane = memo(CampaignPreviewPaneImpl)
