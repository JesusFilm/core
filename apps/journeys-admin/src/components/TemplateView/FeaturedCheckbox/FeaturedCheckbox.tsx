import Checkbox from '@mui/material/Checkbox'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

export function FeaturedCheckbox(): ReactElement {
  const { t } = useTranslation()
  return (
    <Stack>
      <Checkbox />
      <Typography>{t('Mark as Featured')}</Typography>
    </Stack>
  )
}
