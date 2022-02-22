import { ReactElement } from 'react'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/system/Box'
import TranslateRounded from '@mui/icons-material/TranslateRounded'
import Grid from '@mui/material/Grid'
import NextImage from 'next/image'

interface VideoListItemProps {
  title?: string
  description?: string
  poster?: string
  time?: string
  language?: string
}

export function VideoListItem({
  title,
  description,
  poster,
  time,
  language
}: VideoListItemProps): ReactElement {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        px: 6,
        py: 4
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={8}>
          <Typography variant="subtitle2">{title}</Typography>
          <Typography variant="caption">{description}</Typography>
          <Button
            variant="contained"
            startIcon={<TranslateRounded />}
            size="small"
          >
            {language}
            EN US
          </Button>
        </Grid>
        <Grid item xs={4}>
          <Box sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <NextImage
              src={poster ?? ''}
              alt={title}
              height={'79px'}
              width={'79px'}
              objectFit="cover"
            />
            {/* display time somehow */}
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}
