import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import { Theme } from '@mui/material/styles'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { ReactElement, SyntheticEvent, useEffect, useState } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import MediaStrip1Icon from '@core/shared/ui/icons/MediaStrip1'
import Upload1Icon from '@core/shared/ui/icons/Upload1'
import X2Icon from '@core/shared/ui/icons/X2'
import YoutubeIcon from '@core/shared/ui/icons/Youtube'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'

import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../__generated__/GetJourney'
import { VideoBlockUpdateInput } from '../../../../__generated__/globalTypes'
import { setBeaconPageViewed } from '../../../libs/setBeaconPageViewed'

import { VideoFromLocal } from './VideoFromLocal'

const VideoDetails = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/VideoLibrary/VideoDetails/VideoDetails" */ './VideoDetails'
    ).then((mod) => mod.VideoDetails),
  { ssr: false }
)
const VideoFromCloudflare = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/VideoLibrary/VideoFromCloudflare/VideoFromCloudflare" */ './VideoFromCloudflare'
    ).then((mod) => mod.VideoFromCloudflare),
  { ssr: false }
)

const VideoFromYouTube = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/VideoLibrary/VideoFromYouTube/VideoFromYouTube" */ './VideoFromYouTube'
    ).then((mod) => mod.VideoFromYouTube),
  { ssr: false }
)

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
  const router = useRouter()

  useEffect(() => {
    // opens video details if videoId is not null
    // and video library is open
    if (selectedBlock?.videoId != null && open) {
      setOpenVideoDetails(true)
    }
  }, [selectedBlock, open])

  const TabParams = {
    0: 'video-library',
    1: 'video-youtube',
    2: 'video-upload'
  }

  function setRoute(param: string): void {
    router.query.param = param
    void router.push(router, undefined, { shallow: true })
    router.events.on('routeChangeComplete', () => {
      setBeaconPageViewed(param)
    })
  }

  const handleChange = (
    _event: SyntheticEvent<Element, Event>,
    newValue: number
  ): void => {
    setActiveTab(newValue)
    const route = TabParams[newValue]
    if (route != null) setRoute(route)
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
        SlideProps={{ appear: true }}
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
              <X2Icon />
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
              icon={<MediaStrip1Icon />}
              label="Library"
              {...tabA11yProps('video-from-local', 0)}
              sx={{ flexGrow: 1 }}
            />
            <Tab
              icon={<YoutubeIcon />}
              label="YouTube"
              {...tabA11yProps('video-from-youtube', 1)}
              sx={{ flexGrow: 1 }}
            />
            <Tab
              icon={<Upload1Icon />}
              label="Upload"
              {...tabA11yProps('video-from-cloudflare', 2)}
              sx={{ flexGrow: 1 }}
            />
          </Tabs>
        </Box>
        <TabPanel
          name="video-from-local"
          value={activeTab}
          index={0}
          sx={{ flexGrow: 1, overflow: 'scroll' }}
        >
          <VideoFromLocal onSelect={onSelect} />
        </TabPanel>
        <TabPanel
          name="video-from-youtube"
          value={activeTab}
          index={1}
          sx={{ flexGrow: 1, overflow: 'scroll' }}
          unmountUntilVisible
        >
          <VideoFromYouTube onSelect={onSelect} />
        </TabPanel>
        <TabPanel
          name="video-from-cloudflare"
          value={activeTab}
          index={2}
          sx={{ flexGrow: 1, overflow: 'scroll' }}
          unmountUntilVisible
        >
          <VideoFromCloudflare onSelect={onSelect} />
        </TabPanel>
      </Drawer>
      {selectedBlock?.videoId != null && (
        <VideoDetails
          id={selectedBlock.videoId}
          open={openVideoDetails}
          source={selectedBlock.source}
          onClose={handleVideoDetailsClose}
          onSelect={onSelect}
          activeVideoBlock={selectedBlock}
        />
      )}
    </>
  )
}
