import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentPropsWithoutRef } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { BlockFields_VideoBlock as VideoBlock } from '../../../../../../../../../../__generated__/BlockFields'
import { GetVideoVariantLanguages_video } from '../../../../../../../../../../__generated__/GetVideoVariantLanguages'
import { VideoBlockSource } from '../../../../../../../../../../__generated__/globalTypes'
import { ThemeProvider } from '../../../../../../../../ThemeProvider'
import { Drawer } from '../../../../../Drawer'
import { GET_VIDEO_VARIANT_LANGUAGES } from '../../../../../Drawer/VideoBlockEditor/Source/SourceFromLocal/SourceFromLocal'
import { GET_VIDEO } from '../../../../../Drawer/VideoLibrary/VideoFromLocal/LocalDetails/LocalDetails'

import { VideoOptions } from './VideoOptions'

const VideoOptionsDemo: Meta<typeof VideoOptions> = {
  ...journeysAdminConfig,
  component: VideoOptions,
  title:
    'Journeys-Admin/Editor/Slider/Settings/CanvasDetails/Properties/blocks/Video/VideoOptions'
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
  mediaVideo: {
    __typename: 'Video',
    id: '2_0-FallingPlates',
    title: [
      {
        __typename: 'VideoTitle',
        value: 'FallingPlates'
      }
    ],
    images: [
      {
        __typename: 'CloudflareImage',
        mobileCinematicHigh:
          'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/2_0-FallingPlates.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
      }
    ],
    variant: {
      __typename: 'VideoVariant',
      id: '2_0-FallingPlates-529',
      hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
    },
    variantLanguages: []
  },
  posterBlockId: 'poster1.id',
  children: []
}

const videoLanguages: GetVideoVariantLanguages_video = {
  __typename: 'Video',
  id: '2_0-FallingPlates',
  variant: null,
  variantLanguages: [
    {
      __typename: 'Language',
      id: '529',
      name: [
        {
          __typename: 'LanguageName',
          value: 'English',
          primary: true
        }
      ]
    }
  ]
}

const Template: StoryObj<
  ComponentPropsWithoutRef<typeof VideoOptions> & {
    selectedBlock: TreeBlock<VideoBlock>
  }
> = {
  render: ({ selectedBlock }) => (
    <MockedProvider
      mocks={[
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
            selectedBlock
          }}
        >
          <Drawer title="Video Properties">
            <Box sx={{ pt: 4 }}>
              <VideoOptions />
            </Box>
          </Drawer>
        </EditorProvider>
      </ThemeProvider>
    </MockedProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    selectedBlock: video
  }
}

export default VideoOptionsDemo
