import { ReactElement, useEffect, useState } from 'react'
import Typography from '@mui/material/Typography'
import Box from '@mui/system/Box'
import TranslateRounded from '@mui/icons-material/TranslateRounded'
import Grid from '@mui/material/Grid'
import NextImage from 'next/image'
import Chip from '@mui/material/Chip'

interface VideoListItemProps {
  title?: string
  description?: string
  poster?: string
  time?: number
  language?: string
}

export function VideoListItem({
  title,
  description,
  poster,
  time,
  language
}: VideoListItemProps): ReactElement {
  const [convertedTime, setConvertedTime] = useState<string>()

  useEffect((): void => {
    let seconds = Math.floor((time / 1000) % 60)
    let minutes = Math.floor((time / (1000 * 60)) % 60)
    let hours = Math.floor((time / (1000 * 60 * 60)) % 24)

    hours = hours < 10 ? 0 + hours : hours
    minutes = minutes < 10 ? 0 + minutes : minutes
    seconds = seconds < 10 ? 0 + seconds : seconds

    if (minutes < 59) {
      return setConvertedTime(minutes.toString() + ':' + seconds.toString())
    }

    return setConvertedTime(
      hours.toString() + ':' + minutes.toString() + ':' + seconds.toString()
    )
  }, [time])

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
        </Grid>
        <Grid item xs={4}>
          <Box
            sx={{ borderRadius: 2, overflow: 'hidden', position: 'relative' }}
          >
            {poster != null && (
              <NextImage
                src={poster}
                alt={title}
                height={79}
                width={79}
                objectFit="cover"
              />
            )}
            <Box
              sx={{
                display: 'flex',
                backgroundColor: 'secondary.dark',
                px: 1,
                height: 18,
                borderRadius: 2,
                position: 'absolute',
                bottom: 4,
                right: 4,
                zIndex: 1,
                alignItems: 'center'
              }}
            >
              <Typography variant="caption" sx={{ color: '#ffffff' }}>
                {convertedTime}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
      {/* Language needs to be updated to render multiple languages */}
      <Chip
        icon={<TranslateRounded />}
        label={language ?? 'EN (US)'}
        sx={{ fontWeight: 400, fontSize: 12, width: 98 }}
      />
    </Box>
  )
}
