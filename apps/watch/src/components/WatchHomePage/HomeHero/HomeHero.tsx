import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { HeroOverlay } from '../../HeroOverlay'

import JesusHeader from './assets/jesus.jpg'

export function HomeHero(): ReactElement {
  const { t } = useTranslation('apps-watch')

  return (
    <Box
      sx={{
        height: '50svh',
        position: 'relative',
        backgroundColor: 'background.default'
      }}
      data-testid="HomeHero"
    >
      <Image
        src={JesusHeader}
        alt="Jesus Film Project"
        placeholder="blur"
        priority
        fill
        sizes="100vw"
        style={{
          objectFit: 'cover'
        }}
      />
      <HeroOverlay
        sx={{
          background:
            'linear-gradient(0deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), linear-gradient(180.21deg, rgba(50, 50, 51, 0) 63.7%, rgba(38, 38, 38, 0.249497) 75.85%, rgba(27, 27, 28, 0.459525) 85.7%, #000000 99.82%), linear-gradient(89.75deg, #141414 16.19%, rgba(10, 10, 10, 0.495636) 24.01%, rgba(4, 4, 4, 0.195896) 30.68%, rgba(0, 0, 0, 0) 39.07%)'
        }}
      />
      <Container
        maxWidth="xxl"
        sx={{ display: 'flex', zIndex: 2, height: '100%' }}
      >
        <Stack
          direction={{ xs: 'column', xl: 'row' }}
          alignItems={{ xl: 'flex-end' }}
          justifyContent={{ xs: 'flex-end', xl: 'center' }}
          spacing={4}
          sx={{ zIndex: 2 }}
        >
          <Typography variant="h1" color="secondary.contrastText">
            {t('Free Gospel Video')}{' '}
            <Box
              component="span"
              sx={{
                textDecorationLine: 'underline',
                textDecorationThickness: { xs: 5, md: 10 },
                textDecorationColor: (theme) => theme.palette.primary.main,
                textUnderlineOffset: { xs: 5, md: 10 }
              }}
            >
              {t('Streaming')}
            </Box>{' '}
            {t('Library.')}
          </Typography>
          <Typography
            variant="h5"
            component="h2"
            color="secondary.contrastText"
            sx={{ opacity: 0.7 }}
          >
            {t('Watch, learn and share the gospel in over 2000 languages')}
          </Typography>
        </Stack>
      </Container>
    </Box>
  )
}
