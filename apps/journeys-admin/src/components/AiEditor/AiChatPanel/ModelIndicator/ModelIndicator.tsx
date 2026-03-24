import BoltIcon from '@mui/icons-material/Bolt'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

interface ModelIndicatorProps {
  isConnected: boolean
}

export function ModelIndicator({
  isConnected
}: ModelIndicatorProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  if (isConnected) {
    return (
      <Stack
        data-testid="ModelIndicator-connected"
        direction="row"
        alignItems="center"
        justifyContent="center"
        spacing={0.5}
        sx={{ py: 1 }}
      >
        <BoltIcon sx={{ fontSize: 14, color: 'primary.main' }} />
        <Typography
          variant="caption"
          sx={{ color: 'primary.main', fontSize: 11 }}
        >
          {t('Powered by Claude Sonnet 4')} &middot; {t('Settings')} &rarr;
        </Typography>
      </Stack>
    )
  }

  return (
    <Stack
      data-testid="ModelIndicator-disconnected"
      direction="row"
      alignItems="center"
      justifyContent="center"
      spacing={0.5}
      sx={{ py: 1 }}
    >
      <FiberManualRecordIcon
        sx={{ fontSize: 8, color: 'success.main' }}
      />
      <Typography
        variant="caption"
        sx={{ color: '#AAAAAA', fontSize: 11 }}
      >
        {t('AI-powered')} &middot; {t('Use your own Claude key')} &rarr;
      </Typography>
    </Stack>
  )
}
