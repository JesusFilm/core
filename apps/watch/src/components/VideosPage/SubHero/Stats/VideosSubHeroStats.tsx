import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'

export function VideosSubHeroStats(): ReactElement {
  return (
    <Stack direction="row" justifyContent="space-around" spacing={10}>
      <div>
        <Typography variant="h3">134</Typography>
        <Typography variant="overline">Videos</Typography>
      </div>
      <div>
        <Typography variant="h3">140</Typography>
        <Typography variant="overline">Languages</Typography>
      </div>
      <div>
        <Typography variant="h3">3500</Typography>
        <Typography variant="overline">Medias</Typography>
      </div>
    </Stack>
  )
}

export default VideosSubHeroStats
