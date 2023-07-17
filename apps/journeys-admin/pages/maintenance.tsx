import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { NextSeo } from 'next-seo'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import Image from 'next/image'
import logo from '../public/logo.svg'

export default function MaintenancePage(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <>
      <NextSeo title={t("We'll be back.")} />
      <Stack
        spacing={5}
        alignItems="center"
        justifyContent="center"
        sx={{ height: '100vh' }}
      >
        <Box sx={{ mb: 10 }}>
          <Image src={logo} alt="Next Steps" height={68} width={152} />
        </Box>
        <Typography variant="h1">{t("We'll be back.")}</Typography>
        <Typography>
          {t("We're busy updating NextSteps for you and will be back soon.")}
        </Typography>
      </Stack>
    </>
  )
}
