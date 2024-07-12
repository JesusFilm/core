import { Button, Stack, Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { StrategyCarousel } from './StrategyCarousel'

interface StrategySectionProps {
  title: string
  description: string
}

export function StrategySection({
  title,
  description
}: StrategySectionProps): ReactElement {
  // const { items } = useHits(props)
  // item.title
  // description
  // strategycarousel

  // use hook at this level

  const { t } = useTranslation('apps-watch')
  const ButtonStack = () => {
    return (
      <Stack direction="row" spacing={2}>
        <Button>{t('Learn More')}</Button>
        <Button>{t('Request Catalog')}</Button>
        <Button>{t('Get in touch')}</Button>
        <Button variant="contained" sx={{ borderRadius: '32px' }}>
          {t('Register for Training')}
        </Button>
      </Stack>
    )
  }
  return (
    <>
      <Stack
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Typography variant="h4">{t(title)}</Typography>
        <ButtonStack />
      </Stack>
      <Typography variant="subtitle1">{t(description)}</Typography>
      <StrategyCarousel />
    </>
  )
}
