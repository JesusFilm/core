import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, SyntheticEvent, useEffect, useState } from 'react'

import { setBeaconPageViewed } from '@core/journeys/ui/beaconHooks'
import { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import MediaStrip1Icon from '@core/shared/ui/icons/MediaStrip1'
import Upload1Icon from '@core/shared/ui/icons/Upload1'
import YoutubeIcon from '@core/shared/ui/icons/Youtube'
import { TabPanel, tabA11yProps } from '@core/shared/ui/TabPanel'

import { BlockFields_VideoBlock as VideoBlock } from '../../../../../../../__generated__/BlockFields'
import { VideoBlockUpdateInput } from '../../../../../../../__generated__/globalTypes'
import { useMuxVideoUpload } from '../../../../../MuxVideoUploadProvider'
import { DRAWER_WIDTH } from '../../../../constants'
import { DrawerTitle } from '../Drawer'

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

  const {
    state: { selectedBlock: editorSelectedBlock }
  } = useEditor()

  const { getUploadStatus, cancelUploadForBlock } = useMuxVideoUpload()
  const uploadStatus = getUploadStatus(selectedBlock?.id ?? '')

  const [activeTab, setActiveTab] = useState(
    uploadStatus != null ? UPLOAD_TAB : LIBRARY_TAB
  )
  const router = useRouter()

  useEffect(() => {
    setOpenVideoDetails(selectedBlock?.videoId != null && open)
  }, [open, selectedBlock?.videoId])

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

    // use editor provider selected block as this accounts for background videos where the video block does not yet exist, hence the selectedBlock prop is null
    if (editorSelectedBlock != null) cancelUploadForBlock(editorSelectedBlock)

    if (handleSelect != null) handleSelect(block, shouldFocus)
    setOpenVideoDetails(false)
  }

  const handleVideoDetailsClose = (closeParent?: boolean): void => {
    setOpenVideoDetails(false)
    if (closeParent === true) onClose?.()
  }

  return (
    <>
      {open && (
        <Stack
          component={Paper}
          elevation={0}
          sx={{
            position: 'fixed',
            top: 0,
            right: 16,
            bottom: 0,
            width: DRAWER_WIDTH,
            borderRadius: 3,
            overflow: 'hidden',
            backgroundColor: 'background.paper',
            zIndex: (theme) => theme.zIndex.drawer + 1
          }}
          border={1}
          borderColor="divider"
          data-testid="SettingsDrawer"
        >
          <DrawerTitle title={t('Video Library')} onClose={onClose} />
          <Stack
            data-testid="SettingsDrawerContent"
            className="swiper-no-swiping"
            flexGrow={1}
            sx={{ overflow: 'auto', mb: { md: 4 } }}
          >
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
          </Stack>
        </Stack>
      )}
      {selectedBlock?.videoId != null && uploadStatus == null && (
        <VideoDetails
          key={selectedBlock.videoId}
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
