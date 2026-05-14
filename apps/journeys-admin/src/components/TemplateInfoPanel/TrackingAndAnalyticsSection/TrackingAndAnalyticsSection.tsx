import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Trans, useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import ActivityIcon from '@core/shared/ui/icons/Activity'

import { bodySx, mediaSlotSx, numberedListSx } from '../styles'

/**
 * TrackingAndAnalyticsSection — Section 3 of TemplateInfoPanel (NES-1538).
 *
 * Mirrors Figma `39657-66677`. The "Tracking" inline label in step 2 is
 * rendered alongside the same `ActivityIcon` the editor's right-rail Tracking
 * accordion uses, so users learn to recognise the icon in both places.
 */
export function TrackingAndAnalyticsSection(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Stack gap={2} data-testid="TrackingAndAnalyticsSection">
      <Typography sx={bodySx}>
        {t(
          'Track more than just views and responses. To track specific button clicks, video views, or card visits, you must tag those elements as "trackable."'
        )}
      </Typography>
      <Box component="ol" sx={numberedListSx}>
        <li>{t('Select blocks or cards you want to track.')}</li>
        <li>
          <Trans
            t={t}
            i18nKey="Choose an event in <0 /> <1>Tracking</1>."
            components={[
              <ActivityIcon
                key="icon"
                fontSize="small"
                sx={{ verticalAlign: 'middle', mx: 0.5 }}
              />,
              <strong key="emphasis" />
            ]}
          />
        </li>
      </Box>
      <Box
        component="img"
        src="/assets/template-info/tracking-button-properties.png"
        alt={t('Button Properties panel with tracking event configuration')}
        width={333}
        height={227}
        loading="lazy"
        sx={mediaSlotSx}
      />
      <Typography sx={bodySx}>
        {t(
          'After your shared projects generate activity, you will be able to see the statistics for your selected events in a detailed table.'
        )}
      </Typography>
      <Box
        component="img"
        src="/assets/template-info/tracking-analytics-table.png"
        alt={t('Analytics statistics detailed table view showing event data')}
        width={333}
        height={203}
        loading="lazy"
        sx={mediaSlotSx}
      />
    </Stack>
  )
}
