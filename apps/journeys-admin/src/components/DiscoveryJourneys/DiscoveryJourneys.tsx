import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import ArrowRightIcon from '@core/shared/ui/icons/ArrowRight'

import { EmbedJourney } from './EmbedJourney'

export function DiscoveryJourneys(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Stack
      direction="row"
      spacing={{ xs: 2, sm: 8 }}
      data-testid="JourneysAdminDiscoveryJourneys"
    >
      <EmbedJourney slug="admin-left">
        <Typography variant="h1" gutterBottom textAlign="center">
          ⚠️
        </Typography>
        <Typography variant="h6" gutterBottom textAlign="center">
          {t('Beta version')}
        </Typography>
        <Typography variant="h2" gutterBottom textAlign="center">
          {t('NEW HERE?')}
        </Typography>
        <Typography gutterBottom textAlign="center">
          {t(
            'You are one of the first users to test our product. Learn about limitations.'
          )}
        </Typography>
        <Box py={6}>
          <Button size="large" fullWidth endIcon={<ArrowRightIcon />}>
            {t('Start Here')}
          </Button>
        </Box>
      </EmbedJourney>
      <EmbedJourney slug="admin-center">
        <Typography variant="h1" gutterBottom textAlign="center">
          🧭
        </Typography>
        <Typography variant="h6" gutterBottom textAlign="center">
          {t('Help center')}
        </Typography>
        <Typography variant="h2" gutterBottom textAlign="center">
          {t('TUTORIALS')}
        </Typography>
        <Typography gutterBottom textAlign="center">
          <Trans t={t}>
            Watch our video tutorials
            <br />
            or ask a question
          </Trans>
        </Typography>
        <Box py={6}>
          <Button size="large" fullWidth endIcon={<ArrowRightIcon />}>
            {t('Learn More')}
          </Button>
        </Box>
      </EmbedJourney>
      <EmbedJourney slug="admin-right">
        <Typography variant="h1" gutterBottom textAlign="center">
          💬
        </Typography>
        <Typography variant="h6" gutterBottom textAlign="center">
          {t('Free one-on-one')}
        </Typography>
        <Typography variant="h2" gutterBottom textAlign="center">
          {t('ONBOARDING')}
        </Typography>
        <Typography gutterBottom textAlign="center">
          {t(
            'Get hands-on guidance and personalized support or share your feedback.'
          )}
        </Typography>
        <Box py={6}>
          <Button size="large" fullWidth endIcon={<ArrowRightIcon />}>
            {t('Request Now')}
          </Button>
        </Box>
      </EmbedJourney>
    </Stack>
  )
}
