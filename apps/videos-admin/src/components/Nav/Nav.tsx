import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

import { signOut } from '../../auth'

export async function Nav(): Promise<ReactElement> {
  const t = useTranslations()
  return (
    <Stack sx={{ m: 5 }}>
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
    </Stack>
  )
}
