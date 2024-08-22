import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

import { signOut } from '../../../auth'

export async function Nav(): Promise<ReactElement> {
  const t = useTranslations()
  return (
    <Stack>
      <Box
        component="form"
        action={async () => {
          'use server'
          await signOut()
        }}
      >
        <Button type="submit" sx={{ float: 'right' }}>
          {t('Sign Out')}
        </Button>
      </Box>

      <Stack justifyContent="center" alignItems="center">
        <Stack>
          <Typography variant="h4">{t('Nexus Admin')}</Typography>
        </Stack>
      </Stack>
    </Stack>
  )
}
