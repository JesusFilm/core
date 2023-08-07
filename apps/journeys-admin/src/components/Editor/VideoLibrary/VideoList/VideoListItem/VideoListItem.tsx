import Box from '@mui/material/Box'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import { ReactElement, useState } from 'react'

import {
  VideoBlockSource,
  VideoBlockUpdateInput
} from '../../../../../../__generated__/globalTypes'
import { VideoDetails } from '../../VideoDetails'

export interface VideoListItemProps {
  id: string
  title?: string
  description?: string
  image?: string
  duration?: number
  source: VideoBlockSource
  onSelect: (block: VideoBlockUpdateInput) => void
}

export function VideoListItem({
  id,
  title,
  description,
  image,
  source,
  duration: time,
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
    time != null
      ? new Date(time * 1000).toISOString().substring(time < 3600 ? 14 : 11, 19)
      : undefined

  return (
    <>
      <ListItemButton
        onClick={handleOpen}
        sx={{ alignItems: 'flex-start', py: 4, px: 6 }}
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
              {duration != null && (
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
              )}
            </Box>
          </Box>
        )}
      </ListItemButton>
      <VideoDetails
        id={id}
        open={open}
        source={source}
        onClose={handleClose}
        onSelect={handleSelect}
      />
    </>
  )
}
