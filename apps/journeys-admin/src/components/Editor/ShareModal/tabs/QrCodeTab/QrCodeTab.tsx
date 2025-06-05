import TabPanel from '@mui/lab/TabPanel'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import type { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import TransformIcon from '@core/shared/ui/icons/Transform'

import { GetJourneyForSharing_journey as JourneyFromLazyQuery } from '../../../../../../__generated__/GetJourneyForSharing'
import { JourneyFields as JourneyFromContext } from '../../../../../../__generated__/JourneyFields'

interface QrCodeTabProps {
  journey?: JourneyFromContext | JourneyFromLazyQuery
}

export function QrCodeTab({ journey }: QrCodeTabProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))

  return (
    <TabPanel value="1" sx={{ padding: 0 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          px: mdUp ? 0 : 4
        }}
      >
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            {t('QR Code')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {t('Generate a QR code for easy sharing of your journey link')}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            py: 4,
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            backgroundColor: 'background.paper'
          }}
        >
          <TransformIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary" align="center">
            {t('Click the button below to generate a QR code for your journey')}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<TransformIcon />}
            disabled={journey == null}
            sx={{ mt: 1 }}
          >
            {t('Generate QR Code')}
          </Button>
        </Box>
      </Box>
    </TabPanel>
  )
}
