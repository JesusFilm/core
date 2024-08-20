import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import type { GetJourneyAnalytics_journeyReferrer as JourneyReferrer } from '@core/journeys/ui/useJourneyAnalyticsQuery/__generated__/GetJourneyAnalytics'
import ChevronDown from '@core/shared/ui/icons/ChevronDown'

import { BaseReferrer } from '../BaseReferrer'
import { ReferrerValue } from '../ReferrerValue'

export function OtherReferrer({
  referrers
}: {
  referrers: JourneyReferrer[]
}): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const visitorCount = referrers.reduce((acc, referrer) => {
    acc += referrer?.visitors ?? 0

    return acc
  }, 0)

  return (
    <>
      <Box
        sx={{
          width: 180,
          backgroundColor: 'background.paper',
          borderRadius: 4,
          boxShadow: 3
        }}
        data-testid="OtherReferrer"
      >
        <Accordion
          disableGutters
          sx={{
            py: 2,
            px: 3,
            borderRadius: 4,
            '& .MuiAccordionSummary-root': {
              display: 'flex',
              gap: 2
            }
          }}
        >
          <AccordionSummary
            expandIcon={<ChevronDown sx={{ fontSize: '18px' }} />}
            aria-controls="other-referrers"
            sx={{
              minHeight: 0,
              padding: 0,
              flexDirection: 'row-reverse',
              '& .MuiAccordionSummary-content': {
                margin: 0,
                display: 'grid',
                gridTemplateColumns: 'auto 1fr'
              }
            }}
          >
            <ReferrerValue
              tooltipTitle={t('other sources')}
              property={t('other sources')}
              visitors={visitorCount}
            />
          </AccordionSummary>
          <AccordionDetails sx={{ padding: 0 }}>
            <Stack>
              {referrers.map((referrer) => (
                <BaseReferrer
                  key={referrer.property}
                  {...referrer}
                  style={{ padding: 0, mt: 1 }}
                />
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Box>
    </>
  )
}
