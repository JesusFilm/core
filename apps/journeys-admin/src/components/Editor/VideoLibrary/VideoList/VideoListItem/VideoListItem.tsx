import { ReactElement, useState } from 'react'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton from '@mui/material/ListItemButton'

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
  onSelect
}: VideoListItemProps): ReactElement {
  const [open, setOpen] = useState<boolean>(false)

  const handleOpen = (): void => {
    setOpen(!open)
  }

  const duration =
    time < 3600
      ? new Date(time * 1000).toISOString().substring(14, 19)
      : new Date(time * 1000).toISOString().substring(11, 19)

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
        {image != null && (
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
                  borderRadius: 2
                }}
              >
                {duration}
              </Typography>
            </Box>
          </Box>
        )}
      </ListItemButton>
      {/* call VideoDetails here once merged */}
    </>
  )
}
