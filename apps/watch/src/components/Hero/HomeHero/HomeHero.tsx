import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import Image from 'next/image'

import JesusHeader from '../../../../public/images/jesus-header.svg'

export function HomeHero(): ReactElement {
  const theme = useTheme()
  return (
    <Box
      sx={{
        height: { xs: 502, lg: 777 },
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        position: 'relative'
      }}
    >
      <Image
        src={JesusHeader}
        alt="Home Hero"
        layout="fill"
        objectFit="cover"
      />
      <Box
        sx={{
          zIndex: 1,
          position: 'absolute',
          height: '100%',
          width: '100%',
          background:
            'linear-gradient(180deg, rgba(50, 50, 51, 0) 64%, rgba(38, 38, 38, 0.3) 76%, rgba(27, 27, 28, 0.46) 86%, #000000 100%), linear-gradient(90deg, #141414 16%, rgba(10, 10, 10, 0.5) 24%, rgba(4, 4, 4, 0.2) 31%, rgba(0, 0, 0, 0) 40%)'
        }}
      />
      <Container
        maxWidth="xl"
        sx={{ display: 'flex', justifyContent: 'center' }}
      >
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          alignContent="center"
          sx={{ zIndex: 2 }}
        >
          <Typography variant="h1" color="secondary.contrastText">
            Free Gospel Video{' '}
            <Typography
              variant="h1"
              component="span"
              sx={{
                textDecoration: 'underline',
                textDecorationColor: theme.palette.primary.main,
                textUnderlineOffset: 10
              }}
            >
              Streaming
            </Typography>{' '}
            Library
          </Typography>
          <Typography
            variant="h5"
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
