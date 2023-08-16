import { MockedProvider } from '@apollo/client/testing'
import MuiDrawer from '@mui/material/Drawer'
import { Meta, Story } from '@storybook/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { GetJourney_journey_blocks_VideoBlock as VideoBlock } from '../../../../../../../../__generated__/GetJourney'
import { GetVideoVariantLanguages_video } from '../../../../../../../../__generated__/GetVideoVariantLanguages'
import { VideoBlockSource } from '../../../../../../../../__generated__/globalTypes'
import { journeysAdminConfig } from '../../../../../../../libs/storybook'
import { ThemeProvider } from '../../../../../../ThemeProvider'
import { GET_VIDEO_VARIANT_LANGUAGES } from '../../../../../VideoBlockEditor/Source/SourceFromLocal/SourceFromLocal'
import { videos } from '../../../../../VideoLibrary/VideoFromLocal/data'
import { GET_VIDEO } from '../../../../../VideoLibrary/VideoFromLocal/LocalDetails/LocalDetails'
import { GET_VIDEOS } from '../../../../../VideoLibrary/VideoFromLocal/VideoFromLocal'

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
  action: null,
  videoId: '2_0-FallingPlates',
  videoVariantLanguageId: '529',
  source: VideoBlockSource.internal,
  title: null,
  description: null,
  duration: null,
  image: null,
  objectFit: null,
  video: {
    __typename: 'Video',
    id: '2_0-FallingPlates',
    title: [
      {
        __typename: 'Translation',
        value: 'FallingPlates'
      }
    ],
    image:
      'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_0-FallingPlates.mobileCinematicHigh.jpg',
    variant: {
      __typename: 'VideoVariant',
      id: '2_0-FallingPlates-529',
      hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
    }
  },
  posterBlockId: 'poster1.id',
  children: []
}

const videoLanguages: GetVideoVariantLanguages_video = {
  __typename: 'Video',
  id: '2_0-FallingPlates',
  variantLanguages: [
    {
      __typename: 'Language',
      id: '529',
      name: [
        {
          __typename: 'Translation',
          value: 'English',
          primary: true
        }
      ]
    }
  ]
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
      },
      {
        request: {
          query: GET_VIDEO_VARIANT_LANGUAGES,
          variables: {
            id: videoLanguages.id
          }
        },
        result: {
          data: {
            video: videoLanguages
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
