import { Story, Meta } from '@storybook/react'
import { TreeBlock, EditorProvider } from '@core/journeys/ui'
import MuiDrawer from '@mui/material/Drawer'
import { MockedProvider } from '@apollo/client/testing'

import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../../../../__generated__/GetJourney'
import { journeysAdminConfig } from '../../../../../../../libs/storybook'
import { ThemeProvider } from '../../../../../../ThemeProvider'
import { GET_VIDEOS } from '../../../../../VideoLibrary/VideoList/VideoList'
import { GET_VIDEO } from '../../../../../VideoLibrary/VideoDetails/VideoDetails'
import { videos } from '../../../../../VideoLibrary/VideoList/VideoListData'
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
    id: '2_0-FallingPlates',
    variant: {
      __typename: 'VideoVariant',
      id: '2_0-FallingPlates-529',
      hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
    }
  },
  posterBlockId: 'poster1.id',
  children: []
}

export const Default: Story = () => (
  <MockedProvider
    mocks={[
      {
        request: {
          query: GET_VIDEOS,
          variables: {
            offset: 0,
            limit: 5,
            where: {
              availableVariantLanguageIds: ['529'],
              title: null
            }
          }
        },
        result: {
          data: {
            videos
          }
        }
      },
      {
        request: {
          query: GET_VIDEO,
          variables: {
            id: '2_Acts7302-0-0'
          }
        },
        result: {
          data: {
            video: {
              id: '2_Acts7302-0-0',
              image:
                'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7302-0-0.mobileCinematicHigh.jpg',
              primaryLanguageId: '529',
              title: [
                {
                  primary: true,
                  value: 'Jesus Taken Up Into Heaven'
                }
              ],
              description: [
                {
                  primary: true,
                  value:
                    'Jesus promises the Holy Spirit; then ascends into the clouds.'
                }
              ],
              variant: {
                id: 'variantA',
                duration: 144,
                hls: 'https://arc.gt/opsgn'
              }
            }
          }
        }
      }
    ]}
  >
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
