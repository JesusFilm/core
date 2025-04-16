import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { ReactElement, ReactNode } from 'react'

interface VideoImagesLayoutProps {
  banner: ReactNode
  hd: ReactNode
}

export default function VideoImagesLayout({
  banner,
  hd
}: VideoImagesLayoutProps): ReactElement {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <Typography variant="subtitle2" gutterBottom>
          Banner Image
        </Typography>
        {banner}
      </Grid>
      <Grid item xs={12} sm={6}>
        <Typography variant="subtitle2" gutterBottom>
          HD Image
        </Typography>
        {hd}
      </Grid>
    </Grid>
  )
}
