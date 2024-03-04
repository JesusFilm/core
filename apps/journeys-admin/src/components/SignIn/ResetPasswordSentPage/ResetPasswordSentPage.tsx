import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { PageProps } from '../types'

export function ResetPasswordSentPage({
  userEmail,
  setActivePage
}: PageProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <>
      <Typography variant="h6" textAlign="left">
        {t('Check your email')}
      </Typography>
      <Stack gap={4}>
        <Stack>
          <Typography>
            {t(
              'Follow the instructions sent to {{userEmail}} to recover your password',
              { userEmail }
            )}
          </Typography>
        </Stack>
        <Button
          variant="contained"
          size="large"
          color="secondary"
          type="submit"
          fullWidth
          onClick={() => setActivePage?.('home')}
        >
          {t('Done')}
        </Button>
      </Stack>
    </>
  )
}
