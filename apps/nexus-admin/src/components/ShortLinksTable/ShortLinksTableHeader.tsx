import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { FC } from 'react'

export const ShortLinksTableHeader: FC = () => {
  const { t } = useTranslation()

  return (
    <Stack
      sx={{
        p: 4
      }}
      spacing={2}
    >
      <Typography variant="h5">{t('Short Links')}</Typography>
      <Typography variant="subtitle3">
        {t('Additional description if required')}
      </Typography>
    </Stack>
  )
}
