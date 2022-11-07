import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Image from 'next/image'

import { GetVideo_video as Video } from '../../../../__generated__/GetVideo'
import { VideoType } from '../../../../__generated__/globalTypes'

interface SimpleHeroProps {
  loading: boolean
  video: Video
}

export function SimpleHero({ loading, video }: SimpleHeroProps): ReactElement {
  const firstEpisodeImage = video.episodes[0]?.image

  return (
    <Box
      sx={{
        height: { xs: 280, lg: 340 },
        width: '100%',
        display: 'flex',
        alignItems: 'end',
        position: 'relative'
      }}
    >
      {loading && <CircularProgress />}
      {firstEpisodeImage != null && (
        <Image
          src={firstEpisodeImage}
          alt={video?.title[0].value}
          layout="fill"
          objectFit="cover"
        />
      )}
      <Box
        style={{
          zIndex: 1,
          position: 'absolute',
          height: '100%',
          width: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)'
        }}
      />
      <Container
        maxWidth="xl"
        style={{
          zIndex: 2
        }}
      >
        {video.type === VideoType.playlist && (
          <Typography
            variant="overline1"
            color="secondary.contrastText"
            sx={{ opacity: 0.7 }}
          >
            Series
          </Typography>
        )}
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          alignItems={{ xs: 'start', lg: 'end' }}
          justifyContent="space-between"
          pb={15}
        >
          <Typography variant="h1" color="secondary.contrastText">
            {video.title[0]?.value}
          </Typography>
          <Typography
            variant="overline1"
            color="secondary.contrastText"
            sx={{ opacity: 0.7 }}
          >
            {video.episodes.length} Episodes
          </Typography>
        </Stack>
      </Container>
    </Box>
  )
}
