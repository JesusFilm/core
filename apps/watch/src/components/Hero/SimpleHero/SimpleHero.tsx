import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { VideoContentFields } from '../../../../__generated__/VideoContentFields'

interface SimpleHeroProps {
  loading?: boolean
  video: VideoContentFields
}

export function SimpleHero({ loading, video }: SimpleHeroProps): ReactElement {
  return (
    <>
      {loading === true && <CircularProgress />}
      <Box
        sx={{
          backgroundImage: `url(${video.image as string})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: 776
        }}
      >
        <Container
          maxWidth="xl"
          style={{
            position: 'absolute',
            top: 350,
            paddingLeft: 100,
            margin: 0,
            textShadow: '0px 3px 4px rgba(0, 0, 0, 0.25)'
          }}
        >
          <Typography
            variant="h2"
            sx={{
              maxWidth: '600px',
              color: 'text.primary'
            }}
          >
            {video.title[0]?.value}
          </Typography>
        </Container>
      </Box>
    </>
  )
}
