import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

function VideosSubHeroStats(): ReactElement {
  return (
    <Stack
      direction="row"
      spacing={10}
      sx={{ justifyContent: { md: 'flex-end' } }}
    >
      <Box>
        <Typography variant="h3">724</Typography>
        <Typography variant="overline">Videos</Typography>
      </Box>
      <Box>
        <Typography variant="h3">2,042</Typography>
        <Typography variant="overline">Languages</Typography>
      </Box>
    </Stack>
  )
}

export function VideosSubHero(): ReactElement {
  return (
    <Stack py={12} direction={{ xs: 'column-reverse', sm: 'row' }} spacing={9}>
      <Box flex={1}>
        <Typography variant="subtitle1">
          We believe film is the most dynamic way to hear and see the greatest
          story ever lived — so we are driven to bring Christ-centered video to
          the ends of the earth.
        </Typography>
      </Box>
      <Box flex={1}>
        <VideosSubHeroStats />
      </Box>
    </Stack>
  )
}

export default VideosSubHero
