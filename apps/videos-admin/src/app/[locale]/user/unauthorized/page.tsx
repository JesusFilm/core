import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

import { Logout } from '../../Logout'

export default function UnauthorizedPage(): ReactElement {
  const t = useTranslations()
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h1">{t('Unauthorized')}</Typography>
      <Logout />
    </Box>
  )
}
