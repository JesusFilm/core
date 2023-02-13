import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { HeroOverlay } from '../../HeroOverlay'
import JesusHeader from './assets/jesus.jpg'

export function HomeHero(): ReactElement {
  return (
    <Box
      sx={{
        height: { xs: 502, lg: 777 },
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        backgroundColor: 'background.default'
      }}
    >
      <Image
        src={JesusHeader}
        alt="Jesus Film Project"
        layout="fill"
        objectFit="cover"
        placeholder="blur"
        priority
      />
      <HeroOverlay />
      <Container
        maxWidth="xxl"
        sx={{ display: 'flex', justifyContent: 'center', pt: 30 }}
      >
        <Stack
          direction={{ lg: 'column', xl: 'row' }}
          alignContent="center"
          sx={{ zIndex: 2 }}
        >
          <Stack spacing={1}>
            <Typography variant="h1" color="secondary.contrastText">
              Free Gospel Video Streaming Library
            </Typography>
            <Box
              sx={{
                width: '40%',
                height: { xs: 5, lg: 10 },
                backgroundColor: 'primary.main'
              }}
            />
          </Stack>
          <Typography
            variant="h5"
            component="h2"
            color="secondary.contrastText"
            sx={{ opacity: 0.7, pt: 8 }}
          >
            Watch, learn and share the gospel in over 2000 languages
          </Typography>
        </Stack>
      </Container>
    </Box>
  )
}
