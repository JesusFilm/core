import { ReactElement, useEffect, useState } from 'react'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import ListItemText from '@mui/material/ListItemText'
import ListItemButton from '@mui/material/ListItemButton'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import {
  VideoBlockSource,
  VideoBlockUpdateInput
} from '../../../../../../__generated__/globalTypes'
import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../../../__generated__/GetJourney'
import { VideoDetails } from '../../VideoDetails'

export interface VideoListItemProps {
  id: string
  title?: string
  description?: string
  image?: string
  duration?: number
  source: VideoBlockSource
  open?: boolean
  onSelect: (block: VideoBlockUpdateInput) => void
}

export function VideoListItem({
  id,
  title,
  description,
  image,
  source,
  duration: time = 0,
  open: openVideoDetails,
  onSelect: handleSelect
}: VideoListItemProps): ReactElement {
  const {
    state: { selectedStep, selectedBlock }
  } = useEditor()
  const [open, setOpen] = useState(false)

  const card = selectedStep?.children.find(
    (block) => block.__typename === 'CardBlock'
  ) as TreeBlock<CardBlock> | undefined
  useEffect(() => {
    if (selectedBlock?.__typename === 'VideoBlock') {
      if (selectedBlock?.videoId === id) {
        setOpen(true)
      }
    }
    if (card?.coverBlockId != null) {
      setOpen(true)
    }
  }, [selectedBlock, openVideoDetails, id, card])

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
        source={source}
        onClose={handleClose}
        onSelect={handleSelect}
      />
    </>
  )
}
