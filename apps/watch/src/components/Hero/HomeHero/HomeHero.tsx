import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Image from 'next/image'

import JesusHeader from '../../../../public/images/jesus-header.svg'

export function HomeHero(): ReactElement {
  return (
    <Box
      sx={{
        height: 777,
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
        style={{
          zIndex: -1
        }}
      />
      <Box
        style={{
          zIndex: 0,
          position: 'absolute',
          height: '100%',
          width: '100%',
          background:
            'radial-gradient(circle, rgba(255,255,255,0) 0%, rgba(0,0,0,1) 100%)'
        }}
      />
      <Container
        maxWidth="xl"
        sx={{ display: 'flex', justifyContent: 'center' }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'column', md: 'column', lg: 'row' }}
          alignContent="center"
        >
          <Typography
            variant="h1"
            color="secondary.contrastText"
            sx={{ zIndex: 1 }}
          >
            Free Gospel Video{' '}
            <span
              style={{
                textDecoration: 'underline',
                textDecorationColor: '#EF3340',
                textUnderlineOffset: 10
              }}
            >
              Streaming
            </span>{' '}
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
