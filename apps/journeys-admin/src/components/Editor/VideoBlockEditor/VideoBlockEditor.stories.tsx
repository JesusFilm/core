import { Story, Meta } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'
import type { TreeBlock } from '@core/journeys/ui/block'
import MuiDrawer from '@mui/material/Drawer'
import { MockedProvider } from '@apollo/client/testing'

import {
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock,
  GetJourney_journey_blocks_ImageBlock as ImageBlock
} from '../../../../__generated__/GetJourney'
import { GetVideoVariantLanguages_video } from '../../../../__generated__/GetVideoVariantLanguages'
import { journeysAdminConfig } from '../../../libs/storybook'
import {
  ThemeMode,
  VideoBlockSource
} from '../../../../__generated__/globalTypes'
import { ThemeProvider } from '../../ThemeProvider'
import { videos } from '../VideoLibrary/VideoFromLocal/data'
import { GET_VIDEOS } from '../VideoLibrary/VideoFromLocal/VideoFromLocal'
import { VideoBlockEditor } from './VideoBlockEditor'
import { GET_VIDEO_VARIANT_LANGUAGES } from './Source/SourceFromLocal/SourceFromLocal'

const BackgroundMediaStory = {
  ...journeysAdminConfig,
  component: VideoBlockEditor,
  title: 'Journeys-Admin/Editor/VideoBlockEditor',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const card: TreeBlock<CardBlock> = {
  id: 'card1.id',
  __typename: 'CardBlock',
  parentBlockId: 'step1.id',
  parentOrder: 0,
  coverBlockId: null,
  backgroundColor: null,
  themeMode: ThemeMode.light,
  themeName: null,
  fullscreen: true,
  children: []
}

const videoInternal: TreeBlock<VideoBlock> = {
  id: 'video1.id',
  __typename: 'VideoBlock',
  parentBlockId: card.id,
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

const posterInternal: TreeBlock<ImageBlock> = {
  id: 'poster1.id',
  __typename: 'ImageBlock',
  parentBlockId: videoInternal.id,
  parentOrder: 0,
  src: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3',
  width: 300,
  height: 200,
  blurhash: '',
  alt: 'poster',
  children: []
}

const videoYouTube: TreeBlock<VideoBlock> = {
  id: 'video1.id',
  __typename: 'VideoBlock',
  parentBlockId: card.id,
  description:
    'This is episode 1 of an ongoing series that explores the origins, content, and purpose of the Bible.',
  duration: 348,
  endAt: 348,
  fullsize: true,
  image: 'https://i.ytimg.com/vi/ak06MSETeo4/default.jpg',
  muted: false,
  autoplay: true,
  startAt: 0,
  title: 'What is the Bible?',
  videoId: 'ak06MSETeo4',
  videoVariantLanguageId: null,
  parentOrder: 0,
  action: null,
  source: VideoBlockSource.youTube,
  video: null,
  posterBlockId: 'poster1.id',
  children: []
}

const posterYouTube: TreeBlock<ImageBlock> = {
  id: 'poster1.id',
  __typename: 'ImageBlock',
  parentBlockId: videoInternal.id,
  parentOrder: 0,
  src: 'https://images.unsplash.com/photo-1558704164-ab7a0016c1f3',
  width: 300,
  height: 200,
  blurhash: '',
  alt: 'poster',
  children: []
}

const onChange = async (): Promise<void> => await Promise.resolve()
const onDelete = async (): Promise<void> => await Promise.resolve()

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

const Template: Story = ({ ...args }) => (
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
        <VideoBlockEditor
          selectedBlock={args.selectedBlock}
          onChange={onChange}
          onDelete={onDelete}
        />
      </MuiDrawer>
      <MuiDrawer
        anchor="bottom"
        variant="temporary"
        open
        sx={{
          display: { xs: 'block', sm: 'none' }
        }}
      >
        <VideoBlockEditor
          selectedBlock={args.selectedBlock}
          onChange={onChange}
          onDelete={onDelete}
        />
      </MuiDrawer>
    </ThemeProvider>
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  selectedBlock: null
}

export const Internal = Template.bind({})
Internal.args = {
  selectedBlock: {
    ...videoInternal,
    children: [posterInternal]
  }
}

export const YouTube = Template.bind({})
YouTube.storyName = 'YouTube'
YouTube.args = {
  selectedBlock: {
    ...videoYouTube,
    children: [posterYouTube]
  }
}

export const PosterModal = Template.bind({})
PosterModal.args = {
  selectedBlock: {
    ...videoInternal,
    children: [posterInternal]
  }
}

PosterModal.play = async () => {
  const settingsTab = await screen.getAllByTestId('posterCreateButton')[0]
  await userEvent.click(settingsTab)
}

export default BackgroundMediaStory as Meta
