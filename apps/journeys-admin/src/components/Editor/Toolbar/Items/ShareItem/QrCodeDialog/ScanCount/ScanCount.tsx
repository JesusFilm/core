import { gql, useLazyQuery } from '@apollo/client'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatISO } from 'date-fns'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import BarChartSquare3Icon from '@core/shared/ui/icons/BarChartSquare3'

import {
  GetPlausibleJourneyQrCodeScans,
  GetPlausibleJourneyQrCodeScansVariables
} from '../../../../../../../../__generated__/GetPlausibleJourneyQrCodeScans'
import { earliestStatsCollected } from '../../../../../Slider/JourneyFlow/AnalyticsOverlaySwitch'

export const GET_PLAUSIBLE_JOURNEY_QR_CODE_SCANS = gql`
  query GetPlausibleJourneyQrCodeScans(
    $id: ID!
    $filters: String!
    $date: String
  ) {
    journeysPlausibleStatsAggregate(
      id: $id
      idType: databaseId
      where: { period: "custom", date: $date, filters: $filters }
    ) {
      visitors {
        value
      }
    }
  }
`

interface ScanCountProps {
  qrCodeId?: string
}

export function ScanCount({ qrCodeId }: ScanCountProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()

  const [loadPlausibleVisitors, { data }] = useLazyQuery<
    GetPlausibleJourneyQrCodeScans,
    GetPlausibleJourneyQrCodeScansVariables
  >(GET_PLAUSIBLE_JOURNEY_QR_CODE_SCANS)

  useEffect(() => {
    if (journey != null && qrCodeId != null) {
      void loadPlausibleVisitors({
        variables: {
          id: journey.id,
          filters: `visit:utm_campaign==${qrCodeId}`,
          date: `${earliestStatsCollected},${formatISO(new Date(), {
            representation: 'date'
          })}`
        }
      })
    }
  }, [qrCodeId, journey, loadPlausibleVisitors])

  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      sx={{
        color: 'secondary.light'
      }}
    >
      <BarChartSquare3Icon />
      <Typography variant="subtitle3">
        {t('{{count}} scans', {
          count: data?.journeysPlausibleStatsAggregate?.visitors?.value ?? 0
        })}
      </Typography>
    </Stack>
  )
}
