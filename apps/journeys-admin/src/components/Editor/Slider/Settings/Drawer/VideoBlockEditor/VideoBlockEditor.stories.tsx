import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent, waitFor } from '@storybook/test'

import { InstantSearchTestWrapper } from '@core/journeys/ui/algolia/InstantSearchTestWrapper'
import type { TreeBlock } from '@core/journeys/ui/block'
import { journeysAdminConfig } from '@core/shared/ui/storybook'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../__generated__/BlockFields'
import {
  GetVideoVariantLanguages,
  GetVideoVariantLanguages_video
} from '../../../../../../../__generated__/GetVideoVariantLanguages'
import {
  ThemeMode,
  VideoBlockSource
} from '../../../../../../../__generated__/globalTypes'
import { Drawer } from '../Drawer'

import { GET_VIDEO_VARIANT_LANGUAGES } from './Source/SourceFromLocal/SourceFromLocal'
import { VideoBlockEditor } from './VideoBlockEditor'

const BackgroundMediaStory: Meta<typeof VideoBlockEditor> = {
  ...journeysAdminConfig,
  component: VideoBlockEditor,
  title: 'Journeys-Admin/Editor/Slider/Settings/Drawer/VideoBlockEditor',
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
  backdropBlur: null,
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
  children: [],
  scale: null,
  focalLeft: 50,
  focalTop: 50
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
  mediaVideo: {
    __typename: 'YouTube',
    id: 'videoId'
  },
  objectFit: null,
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
  children: [],
  scale: null,
  focalLeft: 50,
  focalTop: 50
}

const onChange = async (): Promise<void> => await Promise.resolve()

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

const mockGetVideoVariantLanguages: MockedResponse<GetVideoVariantLanguages> = {
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

const Template: StoryObj<typeof VideoBlockEditor> = {
  render: (args) => (
    <MockedProvider mocks={[mockGetVideoVariantLanguages]}>
      <InstantSearchTestWrapper>
        <Drawer title="Video Properties">
          <Box sx={{ pt: 4 }}>
            <VideoBlockEditor
              selectedBlock={args.selectedBlock}
              onChange={onChange}
            />
          </Box>
        </Drawer>
      </InstantSearchTestWrapper>
    </MockedProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    selectedBlock: null
  }
}

export const Internal = {
  ...Template,
  args: {
    selectedBlock: {
      ...videoInternal,
      children: [posterInternal]
    }
  }
}

export const YouTube = {
  ...Template,
  args: {
    selectedBlock: {
      ...videoYouTube,
      children: [posterYouTube]
    }
  },
  name: 'YouTube'
}

export const PosterModal = {
  ...Template,
  args: {
    selectedBlock: {
      ...videoInternal,
      children: [posterInternal]
    }
  },
  play: async () => {
    await waitFor(async () => {
      screen.getAllByTestId('posterCreateButton')
    })
    const settingsTab = await screen.getAllByTestId('posterCreateButton')[0]
    await userEvent.click(settingsTab)
  }
}

export const Muted = {
  ...Template,
  args: {
    selectedBlock: {
      ...videoYouTube,
      muted: true
    }
  }
}

export default BackgroundMediaStory
