import { Stack, Typography } from '@mui/material'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

import { TabContainer } from '../Tabs/TabContainer'

function Subtitles({ subtitles }): ReactElement {
  const t = useTranslations()
  return (
    <>
      <Typography variant="h4">{t('Subtitles')}</Typography>
      <pre>{JSON.stringify(subtitles, null, 2)}</pre>
    </>
  )
}

export function Editions({ editions }): ReactElement {
  return (
    <Stack>
      <h1>Editions</h1>
    </Stack>
  )
}
