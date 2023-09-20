import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import NextLink from 'next/link'
import { ReactElement } from 'react'

import ChevronRightIcon from '@core/shared/ui/icons/ChevronRight'

import { JourneysReportType } from '../../../__generated__/globalTypes'
import { MemoizedDynamicReport } from '../DynamicPowerBiReport'

export function MultipleSummaryReport(): ReactElement {
  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor: 'background.paper'
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 6, sm: 8 } }}>
        <Stack direction="row" spacing={4} sx={{ py: 2 }}>
          <Typography variant="subtitle1" sx={{ pt: 1 }}>
            Reports
          </Typography>
          <NextLink href="/reports" passHref legacyBehavior>
            <Button
              size="small"
              variant="text"
              endIcon={<ChevronRightIcon sx={{ fontSize: 1 }} />}
            >
              See all
            </Button>
          </NextLink>
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
