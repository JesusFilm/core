import { ReactElement, useEffect, useState } from 'react'
import Typography from '@mui/material/Typography'
import Box from '@mui/system/Box'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton from '@mui/material/ListItemButton'
import { VideoDetails } from '../../VideoDetails'

// props to be updated according to the arclight changes
interface VideoListItemProps {
  id?: string
  title?: string
  description?: string
  poster?: string
  time: number
  onSelect: (id: string) => void
}

export function VideoListItem({
  id,
  title,
  description,
  poster,
  time,
  onSelect
}: VideoListItemProps): ReactElement {
  const [convertedTime, setConvertedTime] = useState<string>()
  const [open, setOpen] = useState<boolean>(false)

  const handleOpen = (): void => {
    setOpen(!open)
  }

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
    <>
      <ListItemButton
        onClick={handleOpen}
        sx={{ my: 1, alignItems: 'flex-start', mx: -1 }}
      >
        <ListItemText
          primary={title}
          secondary={description}
          secondaryTypographyProps={{
            style: {
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              paddingRight: '2rem'
            }
          }}
        />
        {poster != null && (
          <Box>
            <Box
              sx={{
                justifySelf: 'end',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
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
      </ListItemButton>
      {id != null && (
        <VideoDetails
          open={open}
          videoId={id}
          handleOpen={handleOpen}
          onSelect={onSelect}
        />
      )}
    </>
  )
}
