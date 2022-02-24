import { ReactElement, useEffect, useState } from 'react'
import Typography from '@mui/material/Typography'
import Box from '@mui/system/Box'
import TranslateRounded from '@mui/icons-material/TranslateRounded'
import Chip from '@mui/material/Chip'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton from '@mui/material/ListItemButton'

interface VideoListItemProps {
  title?: string
  description?: string
  poster?: string
  time: number
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
    let seconds = Math.floor((time % 60000) / 1000)
    let minutes = Math.floor(time / 60000)
    let hours = Math.floor(minutes / 60)

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

  // only have one line of text and the rest are dots

  return (
    <>
      <ListItemButton>
        <ListItemText
          primary={title}
          secondary={description}
        />
        {/* recreate grid */}
        {poster != null &&
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
                p: 1,
                height: 79,
                width: 79,
                borderRadius: 2,
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
                backgroundImage: `url(${poster})`
              }}
            >
              <Typography component="div" variant="caption" sx={{
                color: 'background.paper',
                backgroundColor: 'rgba(0, 0, 0, 0.35)',
                px: 1,
                borderRadius: 2,
              }}>
                {convertedTime}
              </Typography>
            </Box>
          </Box>}
        {/* update to display multiple lanaguages */}
        <Box pb={2}>
          <Chip
            icon={<TranslateRounded />}
            size="small"
            label={language ?? 'EN (US)'}
          />
        </Box>
      </ListItemButton>
    </>
  )
}

