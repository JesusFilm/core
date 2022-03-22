import { Story, Meta } from '@storybook/react'
import { TreeBlock, EditorProvider } from '@core/journeys/ui'
import MuiDrawer from '@mui/material/Drawer'
import { MockedProvider } from '@apollo/client/testing'

import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../../../../__generated__/GetJourney'
import { journeysAdminConfig } from '../../../../../../../libs/storybook'
import { ThemeProvider } from '../../../../../../ThemeProvider'
import { VideoOptions } from './VideoOptions'

const VideoOptionsStory = {
  ...journeysAdminConfig,
  component: VideoOptions,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Video/VideoOptions',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const video: TreeBlock<VideoBlock> = {
  id: 'video1.id',
  __typename: 'VideoBlock',
  parentBlockId: 'card.id',
  parentOrder: 0,
  startAt: 0,
  endAt: null,
  muted: false,
  autoplay: true,
  fullsize: true,
  videoId: '2_0-FallingPlates',
  videoVariantLanguageId: '529',
  video: {
    __typename: 'Video',
    variant: {
      __typename: 'VideoVariant',
      hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
    }
  },
  posterBlockId: 'poster1.id',
  children: []
}

export const Default: Story = ({ ...args }) => (
  <MockedProvider>
    <ThemeProvider>
      <EditorProvider
        initialState={{
          selectedBlock: video
        }}
      >
        <MuiDrawer
          anchor="right"
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: 328
            }
          }}
          ModalProps={{
            keepMounted: true
          }}
          open
        >
          <VideoOptions />
        </MuiDrawer>
        <MuiDrawer
          anchor="bottom"
          variant="temporary"
          open
          sx={{
            display: { xs: 'block', sm: 'none' }
          }}
        >
          <VideoOptions />
        </MuiDrawer>
      </EditorProvider>
    </ThemeProvider>
  </MockedProvider>
)

export default VideoOptionsStory as Meta
