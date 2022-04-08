import { ReactElement, useState } from 'react'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton from '@mui/material/ListItemButton'
import { VideoDetails } from '../../VideoDetails'

interface VideoListItemProps {
  id: string
  title?: string
  description?: string
  image?: string
  duration?: number
  onSelect: (videoId: string, videoVariantLanguageId?: string) => void
}

export function VideoListItem({
  id,
  title,
  description,
  image,
  duration: time = 0,
  onSelect: handleSelect
}: VideoListItemProps): ReactElement {
  const [open, setOpen] = useState(false)

  const handleOpen = (): void => {
    setOpen(true)
  }

  const handleClose = (): void => {
    setOpen(false)
  }

  const duration =
    time < 3600
      ? new Date(time * 1000).toISOString().substring(14, 19)
      : new Date(time * 1000).toISOString().substring(11, 19)

  return (
    <>
      <ListItemButton
        onClick={handleOpen}
        sx={{ alignItems: 'flex-start', p: 3 }}
        divider
      >
        <ListItemText
          primary={title}
          secondary={description}
          secondaryTypographyProps={{
            sx: {
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }
          }}
          sx={{ m: 0 }}
        />
        {image != null && (
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
                height: 79,
                width: 79,
                borderRadius: 2,
                ml: 2,
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
                backgroundImage: `url(${image})`
              }}
            >
              <Typography
                component="div"
                variant="caption"
                sx={{
                  color: 'background.paper',
                  backgroundColor: 'rgba(0, 0, 0, 0.35)',
                  px: 1,
                  m: 1,
                  borderRadius: 2
                }}
              >
                {duration}
              </Typography>
            </Box>
          </Box>
        )}
      </ListItemButton>
      <VideoDetails
        id={id}
        open={open}
        onClose={handleClose}
        onSelect={handleSelect}
      />
    </>
  )
}
