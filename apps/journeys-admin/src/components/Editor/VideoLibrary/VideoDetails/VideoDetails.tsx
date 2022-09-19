import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import Drawer from '@mui/material/Drawer'
import Stack from '@mui/material/Stack'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Close from '@mui/icons-material/Close'
import {
  VideoBlockSource,
  VideoBlockUpdateInput
} from '../../../../../__generated__/globalTypes'
import { LocalDetails } from '../VideoFromLocal/LocalDetails'
import { YouTubeDetails } from '../VideoFromYouTube/YouTubeDetails'

export const DRAWER_WIDTH = 328

export interface VideoDetailsProps {
  open: boolean
  id: string
  onClose: () => void
  onSelect: (block: VideoBlockUpdateInput) => void
  source: VideoBlockSource
}

export function VideoDetails({
  open,
  id,
  onClose,
  onSelect,
  source
}: VideoDetailsProps): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  let Details: (
    props: Pick<VideoDetailsProps, 'id' | 'open' | 'onSelect'>
  ) => ReactElement

  switch (source) {
    case VideoBlockSource.internal:
      Details = LocalDetails
      break
    case VideoBlockSource.youTube:
      Details = YouTubeDetails
      break
  }

  function handleSelect(block: VideoBlockUpdateInput): void {
    onSelect(block)
    onClose()
  }

  return (
    <>
      <Drawer
        anchor={smUp ? 'right' : 'bottom'}
        variant="temporary"
        open={open}
        elevation={smUp ? 1 : 0}
        hideBackdrop
        sx={{
          display: { xs: smUp ? 'none' : 'block', sm: smUp ? 'block' : 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: smUp ? DRAWER_WIDTH : '100%',
            height: '100%'
          }
        }}
      >
        <AppBar position="static" color="default">
          <Toolbar variant="dense">
            <Typography
              variant="subtitle1"
              noWrap
              component="div"
              sx={{ flexGrow: 1 }}
            >
              Video Details
            </Typography>
            <IconButton
              onClick={onClose}
              sx={{ display: 'inline-flex' }}
              edge="end"
              aria-label="Close"
            >
              <Close />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Stack spacing={4} sx={{ p: 6 }}>
          <Details id={id} open={open} onSelect={handleSelect} />
        </Stack>
      </Drawer>
    </>
  )
}

export default VideoDetails
