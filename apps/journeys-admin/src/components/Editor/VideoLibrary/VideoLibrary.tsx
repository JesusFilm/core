import { ReactElement, SyntheticEvent, useState, useEffect } from 'react'
import { TreeBlock } from '@core/journeys/ui/block'
import Drawer from '@mui/material/Drawer'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Close from '@mui/icons-material/Close'
import BrushRoundedIcon from '@mui/icons-material/BrushRounded'
import IconButton from '@mui/material/IconButton'
import Toolbar from '@mui/material/Toolbar'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import VideocamIcon from '@mui/icons-material/Videocam'
import YouTubeIcon from '@mui/icons-material/YouTube'
import { VideoBlockUpdateInput } from '../../../../__generated__/globalTypes'
import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../__generated__/GetJourney'
import { VideoFromYouTube } from './VideoFromYouTube'
import { VideoFromLocal } from './VideoFromLocal'
import { VideoDetails } from './VideoDetails'
import { VideoFromCloudflare } from './VideoFromCloudflare'

export const DRAWER_WIDTH = 328
interface VideoLibraryProps {
  open: boolean
  onClose?: () => void
  selectedBlock?: TreeBlock<VideoBlock> | null
  onSelect?: (block: VideoBlockUpdateInput) => void
}

export function VideoLibrary({
  open,
  onClose,
  selectedBlock,
  onSelect: handleSelect
}: VideoLibraryProps): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const [openVideoDetails, setOpenVideoDetails] = useState(false)
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    // opens video details if videoId is not null
    // and video library is open
    if (selectedBlock?.videoId != null && open) {
      setOpenVideoDetails(true)
    }
  }, [selectedBlock, open])

  const handleChange = (
    _event: SyntheticEvent<Element, Event>,
    newValue: number
  ): void => {
    setActiveTab(newValue)
  }

  const onSelect = (block: VideoBlockUpdateInput): void => {
    if (handleSelect != null) handleSelect(block)
    setOpenVideoDetails(false)
    onClose?.()
  }

  const handleVideoDetailsClose = (closeParent?: boolean): void => {
    setOpenVideoDetails(false)
    if (closeParent === true) onClose?.()
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
            height: '100%',
            display: 'flex'
          }
        }}
      >
        <AppBar position="static" color="default">
          <Toolbar>
            <Typography
              variant="subtitle1"
              noWrap
              component="div"
              sx={{ flexGrow: 1 }}
            >
              Video Library
            </Typography>
            <IconButton
              onClick={onClose}
              sx={{ display: 'inline-flex' }}
              edge="end"
            >
              <Close />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            backgroundColor: (theme) => theme.palette.background.paper
          }}
          data-testid="VideoLibrary"
        >
          <Tabs
            value={activeTab}
            onChange={handleChange}
            aria-label="video library tabs"
          >
            <Tab
              icon={<VideocamIcon />}
              label="Library"
              {...tabA11yProps('video-library-panel', 0)}
              sx={{ flexGrow: 1 }}
            />
            <Tab
              icon={<YouTubeIcon />}
              label="YouTube"
              {...tabA11yProps('video-library-panel', 1)}
              sx={{ flexGrow: 1 }}
            />
            <Tab
              icon={<BrushRoundedIcon />}
              label="Custom"
              {...tabA11yProps('video-library-panel', 2)}
              sx={{ flexGrow: 1 }}
            />
          </Tabs>
        </Box>
        <TabPanel
          name="video-library-panel"
          value={activeTab}
          index={0}
          sx={{ flexGrow: 1, overflow: 'scroll' }}
        >
          <VideoFromLocal onSelect={onSelect} />
        </TabPanel>
        <TabPanel
          name="video-library-panel"
          value={activeTab}
          index={1}
          sx={{ flexGrow: 1, overflow: 'scroll' }}
        >
          <VideoFromYouTube onSelect={onSelect} />
        </TabPanel>
        <TabPanel
          name="video-library-panel"
          value={activeTab}
          index={2}
          sx={{ flexGrow: 1, overflow: 'scroll' }}
        >
          <VideoFromCloudflare onSelect={onSelect} />
        </TabPanel>
      </Drawer>
      {selectedBlock?.videoId != null && (
        <VideoDetails
          id={selectedBlock?.videoId}
          open={openVideoDetails}
          source={selectedBlock.source}
          onClose={handleVideoDetailsClose}
          onSelect={onSelect}
          activeVideo
        />
      )}
    </>
  )
}
