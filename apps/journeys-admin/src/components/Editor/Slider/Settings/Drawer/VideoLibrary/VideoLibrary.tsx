import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, SyntheticEvent, useEffect, useState } from 'react'

import { setBeaconPageViewed } from '@core/journeys/ui/beaconHooks'
import { TreeBlock } from '@core/journeys/ui/block'
import MediaStrip1Icon from '@core/shared/ui/icons/MediaStrip1'
import Upload1Icon from '@core/shared/ui/icons/Upload1'
import YoutubeIcon from '@core/shared/ui/icons/Youtube'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'

import { BlockFields_VideoBlock as VideoBlock } from '../../../../../../../__generated__/BlockFields'
import { VideoBlockUpdateInput } from '../../../../../../../__generated__/globalTypes'
import { Drawer } from '../Drawer'

import { VideoFromLocal } from './VideoFromLocal'

const VideoDetails = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/VideoLibrary/VideoDetails/VideoDetails" */ './VideoDetails'
    ).then((mod) => mod.VideoDetails),
  { ssr: false }
)

const VideoFromMux = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/VideoLibrary/VideoFromCMux/VideoFromMux" */ './VideoFromMux'
    ).then((mod) => mod.VideoFromMux),
  { ssr: false }
)

const VideoFromYouTube = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/VideoLibrary/VideoFromYouTube/VideoFromYouTube" */ './VideoFromYouTube'
    ).then((mod) => mod.VideoFromYouTube),
  { ssr: false }
)

interface VideoLibraryProps {
  open: boolean
  onClose?: () => void
  selectedBlock?: TreeBlock<VideoBlock> | null
  onSelect?: (block: VideoBlockUpdateInput, shouldFocus?: boolean) => void
}

const LIBRARY_TAB = 0
const YOUTUBE_TAB = 1
const UPLOAD_TAB = 2

export function VideoLibrary({
  open,
  onClose,
  selectedBlock,
  onSelect: handleSelect
}: VideoLibraryProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [openVideoDetails, setOpenVideoDetails] = useState(
    selectedBlock?.videoId != null && open
  )
  const [activeTab, setActiveTab] = useState(LIBRARY_TAB)
  const router = useRouter()

  useEffect(() => {
    setOpenVideoDetails(
      selectedBlock?.videoId != null && open && activeTab !== UPLOAD_TAB
    )
  }, [open, selectedBlock?.videoId, activeTab])

  const TabParams = {
    [LIBRARY_TAB]: 'video-library',
    [YOUTUBE_TAB]: 'video-youtube',
    [UPLOAD_TAB]: 'video-upload'
  }

  function setRoute(param: string): void {
    void router.push({ query: { ...router.query, param } }, undefined, {
      shallow: true
    })
    router.events.on('routeChangeComplete', () => {
      setBeaconPageViewed(param)
    })
  }

  const handleChange = (
    _event: SyntheticEvent<Element, Event>,
    newValue: number
  ): void => {
    setActiveTab(newValue)
    const route: 'unsplash-image' | 'custom-image' | 'ai-image' =
      TabParams[newValue]
    if (route != null) setRoute(route)
  }

  const onSelect = (
    block: VideoBlockUpdateInput,
    shouldCloseDrawer = true
  ): void => {
    const shouldFocus = shouldCloseDrawer
    if (handleSelect != null) handleSelect(block, shouldFocus)
    setOpenVideoDetails(false)

    // Close drawer unless background upload is still processing
    // Exception: close if user is still on upload tab to show editor settings
    if (shouldCloseDrawer || (!shouldCloseDrawer && activeTab === UPLOAD_TAB)) {
      if (!shouldCloseDrawer && activeTab === UPLOAD_TAB) {
        setActiveTab(LIBRARY_TAB)
      }
      onClose?.()
    }
  }

  const handleVideoDetailsClose = (closeParent?: boolean): void => {
    setOpenVideoDetails(false)
    if (closeParent === true) onClose?.()
  }

  return (
    <>
      <Drawer title={t('Video Library')} open={open} onClose={onClose}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            width: '100%',
            height: 73,
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
              label={t('Library')}
              {...tabA11yProps('video-from-local', LIBRARY_TAB)}
              sx={{ flexGrow: 1 }}
            />
            <Tab
              icon={<YoutubeIcon />}
              label={t('YouTube')}
              {...tabA11yProps('video-from-youtube', YOUTUBE_TAB)}
              sx={{ flexGrow: 1 }}
            />
            <Tab
              icon={<Upload1Icon />}
              label={t('Upload')}
              {...tabA11yProps('video-from-mux', UPLOAD_TAB)}
              sx={{ flexGrow: 1 }}
            />
          </Tabs>
        </Box>

        <Box
          sx={{
            width: '100%',
            height: {
              xs: 'calc(100vh - 295px)',
              sm: 'calc(100vh - 265px)'
            },
            overflowY: 'auto'
          }}
        >
          <TabPanel
            name="video-from-local"
            value={activeTab}
            index={LIBRARY_TAB}
            sx={{ flexGrow: 1, overflow: 'auto' }}
          >
            <VideoFromLocal onSelect={onSelect} />
          </TabPanel>
          <TabPanel
            name="video-from-youtube"
            value={activeTab}
            index={YOUTUBE_TAB}
            sx={{ flexGrow: 1, overflow: 'auto' }}
            unmountUntilVisible
          >
            <VideoFromYouTube onSelect={onSelect} />
          </TabPanel>
          <TabPanel
            name="video-from-mux"
            value={activeTab}
            index={UPLOAD_TAB}
            sx={{ flexGrow: 1, overflow: 'auto' }}
            unmountUntilVisible
          >
            <VideoFromMux onSelect={onSelect} />
          </TabPanel>
        </Box>
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
