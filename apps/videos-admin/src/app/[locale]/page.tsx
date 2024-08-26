import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

interface IndexProps {
  params: { locale: string }
}

export const dynamic = 'force-dynamic'

export default function Index({ params }: IndexProps): ReactElement {
  const t = useTranslations()

  return (
    <Box>
      <Stack justifyContent="center" alignItems="center">
        <Box sx={{ m: 5 }}>
          <Typography variant="h4">{t('Dashboard')}</Typography>
        </Box>
      </Stack>
      <Link href={`${params.locale}/videos`}>
        <Button>{t('Videos')}</Button>
      </Link>
    </Box>
  )
}
