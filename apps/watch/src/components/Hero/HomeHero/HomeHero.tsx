import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import Container from '@mui/material/Container'
import 'video.js/dist/video-js.css'

export function HomeHero(): ReactElement {
  return (
    <Box sx={{ backgroundImage: 'url(/images/jesus-header.png)', height: 776 }}>
      <Container
        maxWidth="xl"
        style={{
          paddingTop: 350,
          textShadow: '0px 3px 4px rgba(0, 0, 0, 0.25)',
          paddingLeft: 100,
          paddingRight: 100,
          margin: 0
        }}
      >
        <Stack direction="row" justifyContent="space-between" width="100%">
          <Box>
            <Typography
              variant="h2"
              color="secondary.contrastText"
              sx={{ whiteSpace: 'nowrap' }}
            >
              Until Everyone
            </Typography>
            <Typography
              variant="h2"
              color="secondary.contrastText"
              sx={{ whiteSpace: 'nowrap' }}
            >
              <u style={{ textDecorationColor: 'primary.main' }}>Sees Jesus</u>.
            </Typography>
          </Box>
          <Typography
            variant="h6"
            color="secondary.contrastText"
            sx={{ opacity: 0.7, whiteSpace: 'nowrap' }}
          >
            The story of the gospel in 78 videos in 1800 languages.
          </Typography>
        </Stack>
      </Container>
    </Box>
  )
}
