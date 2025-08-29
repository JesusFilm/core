import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import ChevronRightIcon from '@core/shared/ui/icons/ChevronRight'

import { JourneysReportType } from '../../../__generated__/globalTypes'
import { MemoizedDynamicReport } from '../DynamicPowerBiReport'

export function MultipleSummaryReport(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor: 'background.paper'
      }}
      data-testid="JourneysAdminMultipleSummaryReport"
    >
      <Container maxWidth="lg" sx={{ px: { xs: 6, sm: 8 } }}>
        <Stack direction="row" spacing={4} sx={{ py: 2 }}>
          <Typography variant="subtitle1" sx={{ pt: 1 }}>
            {t('Reports')}
          </Typography>
          <Button
            LinkComponent={NextLink}
            href="/reports"
            size="small"
            variant="text"
            endIcon={<ChevronRightIcon sx={{ fontSize: 1 }} />}
          >
            {t('See all')}
          </Button>
        </Stack>
        <Box sx={{ height: '160px', pb: 8 }}>
          <MemoizedDynamicReport
            reportType={JourneysReportType.multipleSummary}
          />
        </Box>
      </Container>
    </Box>
  )
}
