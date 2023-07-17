import { ReactElement, memo } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Fade from '@mui/material/Fade'
import { EmbedJourney } from './EmbedJourney'

export const DiscoveryJourneys = memo(
  function DiscoveryJourneys(): ReactElement {
    return (
      <Container sx={{ px: { xs: 6, sm: 0 } }}>
        <Stack
          direction="row"
          spacing={{ xs: 2, sm: 8 }}
          sx={{ height: { xs: 200, sm: 340, md: 450 } }}
        >
          <Fade in timeout={1000}>
            <Box data-testid="left" flexGrow={1} height="100%">
              <EmbedJourney slug="admin-left" />
            </Box>
          </Fade>
          <Fade in timeout={2000}>
            <Box flexGrow={1} height="100%">
              <EmbedJourney slug="admin-center" />
            </Box>
          </Fade>
          <Fade in timeout={3000}>
            <Box flexGrow={1} height="100%">
              <EmbedJourney slug="admin-right" />
            </Box>
          </Fade>
        </Stack>
      </Container>
    )
  }
)
