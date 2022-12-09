import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'

function VideosSubHeroStats(): ReactElement {
  return (
    <Stack direction="row" justifyContent="space-around" spacing={10}>
      <div>
        <Typography variant="h3">724</Typography>
        <Typography variant="overline">Videos</Typography>
      </div>
      <div>
        <Typography variant="h3">2,042</Typography>
        <Typography variant="overline">Languages</Typography>
      </div>
      <div>
        <Typography variant="h3">3500</Typography>
        <Typography variant="overline">Medias</Typography>
      </div>
    </Stack>
  )
}

export function VideosSubHero(): ReactElement {
  return (
    <Grid container mb={12}>
      <Grid item xs={12} sx={{ display: { lg: 'none' } }}>
        <VideosSubHeroStats />
      </Grid>
      <Grid item xs={12} lg={6}>
        <Typography variant="subtitle1">
          We believe film is the most dynamic way to hear and see the greatest
          story ever lived — so we are driven to bring Christ-centered video to
          the ends of the earth.
        </Typography>
      </Grid>
      <Grid
        item
        md={6}
        sx={{ display: { xs: 'none', sm: 'none', md: 'none', lg: 'block' } }}
      >
        <VideosSubHeroStats />
      </Grid>
    </Grid>
  )
}

export default VideosSubHero
