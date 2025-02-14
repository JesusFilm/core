'use client'

import Typography from '@mui/material/Typography'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

export function VideoViewLoading(): ReactElement {
  const t = useTranslations()

  return <Typography>{t('Loading...')}</Typography>
}
