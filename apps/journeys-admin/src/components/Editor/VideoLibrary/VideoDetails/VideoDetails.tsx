import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import Drawer from '@mui/material/Drawer'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Close from '@mui/icons-material/Close'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import SubscriptionsRoundedIcon from '@mui/icons-material/SubscriptionsRounded'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
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
  onClose: (closeParent: boolean) => void
  onSelect: (block: VideoBlockUpdateInput) => void
  onLibraryClose?: () => void
  source: VideoBlockSource
  showChangeVideoBar?: boolean
  onClearVideo?: () => void
}

export function VideoDetails({
  open,
  id,
  onLibraryClose,
  onClose,
  onSelect,
  source,
  showChangeVideoBar,
  onClearVideo
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
    onClose(false)
  }

  function handleClearVideo(): void {
    onSelect({
      videoId: null,
      videoVariantLanguageId: null,
      source: null
    })
    onClose(false)
    if (onLibraryClose != null) onLibraryClose()
    if (onClearVideo != null) onClearVideo()
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
          left: {
            xs: 0,
            sm: 'unset'
          },
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
              onClick={() => {
                onClose(false)
                if (onLibraryClose != null) onLibraryClose()
              }}
              sx={{ display: 'inline-flex' }}
              edge="end"
              aria-label="Close"
            >
              <Close />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Stack sx={{ display: 'flex', justifyContent: 'center' }}>
          {showChangeVideoBar === true && (
            <Stack
              direction="row"
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mx: 6,
                mt: 4
              }}
            >
              <Box>
                <Button
                  startIcon={<SubscriptionsRoundedIcon />}
                  size="small"
                  onClick={() => onClose(false)}
                >
                  Change Video
                </Button>
              </Box>
              <Box>
                <IconButton
                  onClick={() => handleClearVideo()}
                  size="small"
                  aria-label="clear-video"
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Box>
            </Stack>
          )}
          <Box
            sx={{
              flexGrow: 1,
              overflow: 'auto',
              pt: showChangeVideoBar === true ? 0 : 6
            }}
          >
            <Details id={id} open={open} onSelect={handleSelect} />
          </Box>
        </Stack>
      </Drawer>
    </>
  )
}

export default VideoDetails
