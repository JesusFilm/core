import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Image from 'next/image'

import { GetVideo_video as Video } from '../../../../__generated__/GetVideo'

interface SimpleHeroProps {
  loading: boolean
  video: Video
}

export function SimpleHero({ loading, video }: SimpleHeroProps): ReactElement {
  const image = video.episodes[0].image as string

  return (
    <Box
      sx={{
        height: 340,
        width: '100%',
        display: 'flex',
        alignItems: 'end',
        position: 'relative'
      }}
    >
      {loading && <CircularProgress />}
      <Image
        src={image}
        alt={video?.title[0].value}
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
          backgroundColor: 'rgba(0,0,0,0.6)'
        }}
      />
      <Container
        maxWidth="xl"
        style={{
          zIndex: 1
        }}
      >
        {/* render video type */}
        <Stack
          direction={{ xs: 'column', sm: 'column', md: 'column', lg: 'row' }}
          alignItems={{ xs: 'start', lg: 'end' }}
          justifyContent="space-between"
          pb={10}
        >
          <Typography variant="h1" color="secondary.contrastText">
            {video.title[0]?.value}
          </Typography>
          <Typography variant="overline1" color="secondary.contrastText">
            {video.episodes.length} Episodes
          </Typography>
        </Stack>
      </Container>
    </Box>
  )
}
