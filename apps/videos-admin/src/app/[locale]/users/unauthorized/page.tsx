import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

import minimalLogo from '../../../../assets/minimal-logo.png'
import { CenterPage } from '../../../../components/CenterPage'
import { Logout } from '../../_Logout'

export default function UnauthorizedPage(): ReactElement {
  const t = useTranslations()
  return (
    <CenterPage>
      <Image
        src={minimalLogo}
        alt={t('Jesus Film Project')}
        width={100}
        height={100}
      />
      <Box>
        <Typography
          component="h1"
          variant="h4"
          sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
        >
          {t('401 Unauthorized')}
        </Typography>
        <Typography>
          {t(
            "We couldn't validate your credentials. Please ask an administrator to add the necessary role to your account."
          )}
        </Typography>
      </Box>
      <Logout />
    </CenterPage>
  )
}
