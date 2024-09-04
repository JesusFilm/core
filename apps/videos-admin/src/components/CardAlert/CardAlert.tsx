import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

export function CardAlert(): ReactElement {
  const t = useTranslations()
  return (
    <Card variant="outlined" sx={{ m: 1.5, p: 1.5 }}>
      <CardContent>
        <AutoAwesomeRoundedIcon fontSize="small" />
        <Typography gutterBottom sx={{ fontWeight: 600 }}>
          {t('Plan about to expire')}
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          {t('Enjoy 10% off when renewing your plan today.')}
        </Typography>
        <Button variant="contained" size="small" fullWidth>
          {t('Get the discount')}
        </Button>
      </CardContent>
    </Card>
  )
}
