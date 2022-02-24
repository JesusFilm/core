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

  return (
    <ListItemButton
      sx={{
        display: 'grid',
        gap: 1,
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'auto',
        gridTemplateAreas: `"Text Text Text Image" 
        "Language Language Language Language"`
      }}
    >
      <ListItemText
        primary={title}
        secondary={description}
        sx={{ gridArea: 'Text' }}
      />
      {poster != null && (
        <Box>
          <Box
            sx={{
              gridArea: 'Image',
              justifySelf: 'end',
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
            <Typography
              component="div"
              variant="caption"
              sx={{
                color: 'background.paper',
                backgroundColor: 'rgba(0, 0, 0, 0.35)',
                px: 1,
                borderRadius: 2
              }}
            >
              {convertedTime}
            </Typography>
          </Box>
        </Box>
      )}
      {/* update to display multiple lanaguages */}
      <Box sx={{ py: 2, gridArea: 'Language' }}>
        <Chip
          icon={<TranslateRounded />}
          size="small"
          label={language ?? 'EN (US)'}
          sx={{ mr: 1 }}
        />
      </Box>
    </ListItemButton>
  )
}
