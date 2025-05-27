import { UseChatHelpers } from '@ai-sdk/react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

interface StateErrorProps {
  error: UseChatHelpers['error']
  reload: UseChatHelpers['reload']
}

export function StateError({
  error,
  reload
}: StateErrorProps): ReactElement | null {
  const { t } = useTranslation('apps-journeys-admin')

  return error != null ? (
    <Box>
      <Typography>{t('An error occurred. Please try again.')}</Typography>
      <Button onClick={() => reload()}>{t('Retry')}</Button>
    </Box>
  ) : null
}
