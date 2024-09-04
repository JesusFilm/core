import Typography from '@mui/material/Typography'
import { PageContainer } from '@toolpad/core'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

export default async function HomePage(): Promise<ReactElement> {
  const t = useTranslations()

  return (
    <PageContainer>
      <Typography variant="h4" component="h1" sx={{ m: 2 }}>
        {t('Welcome to JFP Media Management')}
      </Typography>
    </PageContainer>
  )
}
