import Stack from '@mui/material/Stack'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

export function Editions({ editions }): ReactElement {
  const t = useTranslations()
  return (
    <Stack>
      <h1>{t('Editions')}</h1>
    </Stack>
  )
}